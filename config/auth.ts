import { NextAuthOptions } from "next-auth";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { prisma } from "@/lib/prisma";
import GoogleProvider from "next-auth/providers/google";
import GithubProvider from "next-auth/providers/github";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { UserRole } from "@prisma/client";
import { 
  validatePassword, 
  logSecurityEvent, 
  generateSecureToken,
  hashSensitiveData,
  isValidEmail 
} from "@/lib/security";

interface ExtendedUser {
  role?: UserRole;
}

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      authorization: {
        params: {
          prompt: "consent",
          access_type: "offline",
          response_type: "code",
          scope: "openid email profile"
        }
      },
      httpOptions: {
        timeout: 10000 // Increase timeout to 10 seconds
      }
    }),
    GithubProvider({
      clientId: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
      httpOptions: {
        timeout: 10000 // Increase timeout to 10 seconds
      }
    }),
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials, req) {
        if (!credentials?.email || !credentials?.password) {
          await logSecurityEvent('LOGIN_ATTEMPT_MISSING_CREDENTIALS', undefined, {
            ip: req.headers?.['x-forwarded-for'] || req.headers?.['x-real-ip'],
            userAgent: req.headers?.['user-agent'],
          });
          throw new Error("Invalid credentials");
        }

        // Validate email format
        if (!isValidEmail(credentials.email)) {
          await logSecurityEvent('LOGIN_ATTEMPT_INVALID_EMAIL', undefined, {
            email: hashSensitiveData(credentials.email),
            ip: req.headers?.['x-forwarded-for'] || req.headers?.['x-real-ip'],
            userAgent: req.headers?.['user-agent'],
          });
          throw new Error("Invalid email format");
        }

        const user = await prisma.user.findUnique({
          where: {
            email: credentials.email.toLowerCase().trim(),
          },
        });

        if (!user || !user?.password) {
          await logSecurityEvent('LOGIN_ATTEMPT_USER_NOT_FOUND', undefined, {
            email: hashSensitiveData(credentials.email),
            ip: req.headers?.['x-forwarded-for'] || req.headers?.['x-real-ip'],
            userAgent: req.headers?.['user-agent'],
          });
          throw new Error("Invalid credentials");
        }

        if (!user.emailVerified) {
          await logSecurityEvent('LOGIN_ATTEMPT_UNVERIFIED_EMAIL', user.id, {
            email: hashSensitiveData(credentials.email),
            ip: req.headers?.['x-forwarded-for'] || req.headers?.['x-real-ip'],
            userAgent: req.headers?.['user-agent'],
          });
          throw new Error("Please verify your email before logging in");
        }

        const isCorrectPassword = await bcrypt.compare(
          credentials.password,
          user.password
        );

        if (!isCorrectPassword) {
          await logSecurityEvent('LOGIN_ATTEMPT_INVALID_PASSWORD', user.id, {
            email: hashSensitiveData(credentials.email),
            ip: req.headers?.['x-forwarded-for'] || req.headers?.['x-real-ip'],
            userAgent: req.headers?.['user-agent'],
          });
          throw new Error("Invalid credentials");
        }

        // Log successful login
        await logSecurityEvent('LOGIN_SUCCESS', user.id, {
          email: hashSensitiveData(credentials.email),
          ip: req.headers?.['x-forwarded-for'] || req.headers?.['x-real-ip'],
          userAgent: req.headers?.['user-agent'],
        });

        return user;
      },
    }),
  ],
  pages: {
    signIn: "/login",
    error: "/error",
  },
  debug: process.env.NODE_ENV === "development",
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
    updateAge: 24 * 60 * 60, // Update session every 24 hours
  },
  secret: process.env.NEXTAUTH_SECRET,
  callbacks: {
    async jwt({ token, user, trigger, session }) {
      if (trigger === "update" && session?.role) {
        token.role = session.role;
      }
      
      if (user) {
        token.role = (user as ExtendedUser).role;
        token.emailVerified = (user as any).emailVerified;
      }
      
      return token;
    },
    async session({ session, token }) {
      if (token.sub) {
        try {
          const user = await prisma.user.findUnique({
            where: { id: token.sub },
            select: { role: true, emailVerified: true },
          });
          if (user && session.user) {
            (session.user as any).role = user.role;
            (session.user as any).id = token.sub;
            (session.user as any).emailVerified = user.emailVerified;
          }
        } catch (error) {
          console.error("Error fetching user in session callback:", error);
          await logSecurityEvent('SESSION_CALLBACK_ERROR', token.sub, {
            error: error instanceof Error ? error.message : 'Unknown error',
          });
        }
      }
      return {
        ...session,
        user: {
          ...session.user,
          role: token.role,
          id: token.sub,
          emailVerified: token.emailVerified,
        },
      };
    },
    async signIn({ user, account, profile }) {
      // Log sign-in attempts
      await logSecurityEvent('SIGN_IN_ATTEMPT', user.id, {
        provider: account?.provider,
        email: hashSensitiveData(user.email || ''),
      });
      
      return true;
    },
    async redirect({ url, baseUrl }) {
      // Prevent open redirects
      if (url.startsWith('/')) return `${baseUrl}${url}`;
      else if (new URL(url).origin === baseUrl) return url;
      return baseUrl;
    },
  },
  events: {
    async signIn({ user }) {
      try {
        await prisma.user.update({
          where: { id: user.id },
          data: { lastLogin: new Date() }
        });
        
        await logSecurityEvent('USER_LOGIN_UPDATED', user.id, {
          lastLogin: new Date().toISOString(),
        });
      } catch (error) {
        console.error("Error updating last login:", error);
        await logSecurityEvent('LOGIN_UPDATE_ERROR', user.id, {
          error: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    },
    async signOut({ token }) {
      if (token?.sub) {
        await logSecurityEvent('USER_SIGNED_OUT', token.sub as string);
      }
    },
  }
}; 