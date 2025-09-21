export type Project = {
  id: string;
  name: string;
  description: string;
  category: "free" | "paid" | "premium";
  price?: number;
  githubRepo?: string;
  ownerId: string;
  createdAt: Date;
  updatedAt: Date;
  owner?: {
    id: string;
    name: string | null;
    email: string | null;
    image: string | null;
  };
  files?: {
    id: string;
    fileName: string;
    fileSize: number;
    mimeType: string;
    isPublic: boolean;
    createdAt: Date;
  }[];
  _count?: {
    files: number;
  };
};

export type ProjectsResponse = {
  projects: Project[];
  totalCount: number;
  hasMore: boolean;
};
