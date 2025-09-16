// "use client";

// import React, { useState } from "react";
// import { Button } from "@/components/ui/button";
// import { Check, Copy } from "lucide-react";
// import Highlight, { defaultProps } from "prism-react-renderer";
// import theme from "prism-react-renderer/themes/vsDark";

// interface CodeBlockProps {
//   language: string;
//   fileName?: string;
//   children: string;
//   className?: string;
// }

// export const CodeBlock: React.FC<CodeBlockProps> = ({
//   language,
//   fileName,
//   children,
//   className,
// }) => {
//   const [copied, setCopied] = useState(false);

//   const copyToClipboard = async () => {
//     try {
//       await navigator.clipboard.writeText(children);
//       setCopied(true);
//       setTimeout(() => setCopied(false), 2000);
//     } catch (err) {
//       console.error("Failed to copy code:", err);
//     }
//   };

//   return (
//     <div
//       className={`relative rounded-lg overflow-hidden border border-border bg-muted/70 backdrop-blur ${className}`}
//     >
//       {/* Top bar */}
//       <div className="flex items-center justify-between px-4 py-2 bg-muted border-b border-border">
//         <span className="text-sm font-mono text-muted-foreground truncate">
//           {fileName || language}
//         </span>
//         <Button
//           variant="ghost"
//           size="icon"
//           className="h-7 w-7"
//           onClick={copyToClipboard}
//         >
//           {copied ? (
//             <Check className="h-4 w-4 text-green-500" />
//           ) : (
//             <Copy className="h-4 w-4 text-muted-foreground" />
//           )}
//         </Button>
//       </div>

//       {/* Syntax highlighted code */}
//       <Highlight
//         {...defaultProps}
//         code={children.trim()}
//         language={language as any}
//         theme={theme}
//       >
//         {({ className: prismClass, style, tokens, getLineProps, getTokenProps }) => (
//           <pre
//             className={`text-sm p-4 overflow-x-auto ${prismClass}`}
//             style={{ ...style, background: "transparent" }}
//           >
//             {tokens.map((line, i) => (
//               <div key={i} {...getLineProps({ line })}>
//                 {line.map((token, key) => (
//                   <span key={key} {...getTokenProps({ token })} />
//                 ))}
//               </div>
//             ))}
//           </pre>
//         )}
//       </Highlight>
//     </div>
//   );
// };
