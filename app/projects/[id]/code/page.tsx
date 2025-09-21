'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { MainLayout } from '@/components/layout/main-layout'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ArrowLeft, Folder, File, Download, GitBranch, Star, GitFork, Code, Clock, User } from 'lucide-react'
import Link from 'next/link'
import { Project } from '@/types/project'
import dynamic from 'next/dynamic'
import { useTheme } from 'next-themes'

const Editor = dynamic(() => import('@monaco-editor/react'), { ssr: false })

interface FileItem {
  name: string
  type: 'file' | 'folder'
  path: string
  content?: string
  size?: string
  lastModified?: string
  children?: FileItem[]
  commitMessage?: string
  commitHash?: string
  author?: string
  storageUrl?: string
}

export default function ProjectCodePage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter()
  const [project, setProject] = useState<Project | null>(null)
  const [files, setFiles] = useState<FileItem[]>([])
  const [selectedFile, setSelectedFile] = useState<FileItem | null>(null)
  const [loading, setLoading] = useState(true)
  const [projectId, setProjectId] = useState<string>('')
  const [currentPath, setCurrentPath] = useState<string>('')
  const [breadcrumbs, setBreadcrumbs] = useState<string[]>([])
  const [allFiles, setAllFiles] = useState<FileItem[]>([])
  const [repoStats, setRepoStats] = useState({
    totalCommits: 0,
    lastCommit: '',
    lastCommitHash: '',
    lastCommitMessage: '',
    author: '',
    branch: 'main'
  })
  const [githubRepo, setGithubRepo] = useState({ owner: '', repo: '' })
  const { theme } = useTheme()

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { id } = await params
        setProjectId(id)
        
        const [projectRes, purchaseRes] = await Promise.all([
          fetch(`/api/projects/${id}`),
          fetch(`/api/projects/${id}/purchase-status`)
        ])
        
        if (!projectRes.ok) {
          router.push('/projects')
          return
        }
        
        const projectData = await projectRes.json()
        setProject(projectData)
        
        const purchaseData = await purchaseRes.json()
        if (!purchaseData.purchased && projectData.category !== 'free') {
          router.push(`/projects/${id}`)
          return
        }
        
        // Try to load cached repository data first
        await loadCachedRepository(id)
        
        const rootFiles = [
          { 
            name: 'src', 
            type: 'folder' as const, 
            path: 'src',
            size: '-',
            lastModified: '2 hours ago',
            commitMessage: 'Refactor components structure',
            author: 'john-doe',
            children: [
              { name: 'components', type: 'folder' as const, path: 'src/components', size: '-', lastModified: '1 hour ago', commitMessage: 'Add new Header component', author: 'jane-smith', children: [
                { name: 'Header.js', type: 'file' as const, path: 'src/components/Header.js', size: '1.5 KB', lastModified: '1 hour ago', commitMessage: 'Create responsive header', author: 'jane-smith', content: 'import React from "react";\nimport "./Header.css";\n\nconst Header = ({ title = "My App" }) => {\n  return (\n    <header className="header">\n      <div className="container">\n        <h1 className="logo">{title}</h1>\n        <nav className="nav">\n          <ul>\n            <li><a href="#home">Home</a></li>\n            <li><a href="#about">About</a></li>\n            <li><a href="#contact">Contact</a></li>\n          </ul>\n        </nav>\n      </div>\n    </header>\n  );\n};\n\nexport default Header;' }
              ]},
              { name: 'App.js', type: 'file' as const, path: 'src/App.js', size: '2.1 KB', lastModified: '2 hours ago', commitMessage: 'Update main App component', author: 'john-doe', content: 'import React, { useState, useEffect } from "react";\nimport Header from "./components/Header";\nimport "./App.css";\n\nfunction App() {\n  const [data, setData] = useState(null);\n  const [loading, setLoading] = useState(true);\n\n  useEffect(() => {\n    // Simulate API call\n    setTimeout(() => {\n      setData({ message: "Welcome to My App!" });\n      setLoading(false);\n    }, 1000);\n  }, []);\n\n  if (loading) {\n    return <div className="loading">Loading...</div>;\n  }\n\n  return (\n    <div className="App">\n      <Header title="My React App" />\n      <main className="main-content">\n        <h1>{data?.message}</h1>\n        <p>This is a modern React application with hooks.</p>\n      </main>\n    </div>\n  );\n}\n\nexport default App;' }
            ]
          },
          { name: 'public', type: 'folder' as const, path: 'public', size: '-', lastModified: '1 day ago', commitMessage: 'Initial project setup', author: 'john-doe', children: [
            { name: 'index.html', type: 'file' as const, path: 'public/index.html', size: '1.8 KB', lastModified: '1 day ago', commitMessage: 'Add meta tags and favicon', author: 'john-doe', content: '<!DOCTYPE html>\n<html lang="en">\n<head>\n  <meta charset="UTF-8">\n  <meta name="viewport" content="width=device-width, initial-scale=1.0">\n  <meta name="description" content="My React App - A modern web application">\n  <meta name="keywords" content="react, javascript, web app">\n  <title>My React App</title>\n  <link rel="icon" href="%PUBLIC_URL%/favicon.ico" />\n</head>\n<body>\n  <noscript>You need to enable JavaScript to run this app.</noscript>\n  <div id="root"></div>\n</body>\n</html>' }
          ]},
          { name: 'README.md', type: 'file' as const, path: 'README.md', size: '1.2 KB', lastModified: '2 hours ago', commitMessage: 'Update documentation', author: 'john-doe', content: '# My React App\n\n![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)\n![License](https://img.shields.io/badge/license-MIT-green.svg)\n\nA modern React application built with the latest features and best practices.\n\n## Features\n\n- ⚡ Fast and responsive\n- 🎨 Modern UI design\n- 📱 Mobile-friendly\n- 🔧 Easy to customize\n\n## Getting Started\n\n### Prerequisites\n\n- Node.js (v14 or higher)\n- npm or yarn\n\n### Installation\n\n```bash\n# Clone the repository\ngit clone https://github.com/username/my-react-app.git\n\n# Navigate to project directory\ncd my-react-app\n\n# Install dependencies\nnpm install\n\n# Start development server\nnpm start\n```\n\n## Available Scripts\n\n- `npm start` - Runs the app in development mode\n- `npm build` - Builds the app for production\n- `npm test` - Launches the test runner\n\n## Contributing\n\nPull requests are welcome! Please read our contributing guidelines first.' },
          { name: 'package.json', type: 'file' as const, path: 'package.json', size: '856 B', lastModified: '1 day ago', commitMessage: 'Update dependencies', author: 'john-doe', content: '{\n  "name": "my-react-app",\n  "version": "1.0.0",\n  "private": true,\n  "description": "A modern React application",\n  "author": "John Doe <john@example.com>",\n  "license": "MIT",\n  "dependencies": {\n    "react": "^18.2.0",\n    "react-dom": "^18.2.0",\n    "react-scripts": "5.0.1",\n    "web-vitals": "^3.3.2"\n  },\n  "scripts": {\n    "start": "react-scripts start",\n    "build": "react-scripts build",\n    "test": "react-scripts test",\n    "eject": "react-scripts eject"\n  },\n  "eslintConfig": {\n    "extends": [\n      "react-app",\n      "react-app/jest"\n    ]\n  },\n  "browserslist": {\n    "production": [\n      ">0.2%",\n      "not dead",\n      "not op_mini all"\n    ],\n    "development": [\n      "last 1 chrome version",\n      "last 1 firefox version",\n      "last 1 safari version"\n    ]\n  }\n}' }
        ]
        
        // Always set mock data as fallback
        setFiles(rootFiles)
        setAllFiles(rootFiles)
        
      } catch (error) {
        console.error('Error fetching data:', error)
        router.push('/projects')
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [params, router])

  const loadCachedRepository = async (projectId: string) => {
    try {
      const response = await fetch(`/api/projects/${projectId}/cached-files`)
      if (response.ok) {
        const data = await response.json()
        const cachedFiles = data.files.map((file: any) => ({
          name: file.name,
          type: file.type === 'dir' ? 'folder' as const : 'file' as const,
          path: file.path,
          size: formatBytes(file.size),
          lastModified: '2 hours ago',
          commitMessage: 'Cached from private repository',
          author: 'Repository Owner',
          storageUrl: file.storageUrl
        }))
        
        setFiles(cachedFiles)
        setAllFiles(cachedFiles)
        
        setRepoStats({
          totalCommits: 47,
          lastCommit: formatDate(data.lastSync),
          lastCommitHash: 'cached',
          lastCommitMessage: 'Repository cached from private source',
          author: 'Repository Owner',
          branch: 'main'
        })
      }
    } catch (error) {
      console.error('Error loading cached repository:', error)
    }
  }

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 B'
    const k = 1024
    const sizes = ['B', 'KB', 'MB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i]
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffTime = Math.abs(now.getTime() - date.getTime())
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    
    if (diffDays === 1) return '1 day ago'
    if (diffDays < 7) return `${diffDays} days ago`
    if (diffDays < 30) return `${Math.ceil(diffDays / 7)} weeks ago`
    return `${Math.ceil(diffDays / 30)} months ago`
  }



  const getLanguageFromFile = (filename: string) => {
    const ext = filename.split('.').pop()?.toLowerCase()
    switch (ext) {
      case 'js': case 'jsx': return 'javascript'
      case 'ts': case 'tsx': return 'typescript'
      case 'json': return 'json'
      case 'md': return 'markdown'
      case 'html': return 'html'
      case 'css': return 'css'
      default: return 'javascript'
    }
  }

  const findFileByPath = (files: FileItem[], targetPath: string): FileItem | null => {
    for (const file of files) {
      if (file.path === targetPath) {
        return file
      }
      if (file.children) {
        const found = findFileByPath(file.children, targetPath)
        if (found) return found
      }
    }
    return null
  }

  const handleFileClick = async (file: FileItem) => {
    if (file.type === 'file') {
      // Load file content from Supabase Storage
      if (!file.content && file.storageUrl) {
        try {
          const response = await fetch(`/api/projects/${projectId}/cached-files`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ filePath: file.path })
          })
          
          if (response.ok) {
            const data = await response.json()
            file.content = data.content
          }
        } catch (error) {
          console.error('Error loading file content:', error)
        }
      }
      setSelectedFile(file)
    } else {
      setCurrentPath(file.path)
      setBreadcrumbs(file.path.split('/').filter(Boolean))
      if (file.children) {
        setFiles(file.children)
      }
    }
  }

  const navigateToPath = (pathIndex: number) => {
    if (pathIndex === -1) {
      setCurrentPath('')
      setBreadcrumbs([])
      setFiles(allFiles)
      setSelectedFile(null)
    } else {
      const newPath = breadcrumbs.slice(0, pathIndex + 1).join('/')
      const targetFile = findFileByPath(allFiles, newPath)
      if (targetFile && targetFile.children) {
        setCurrentPath(newPath)
        setBreadcrumbs(breadcrumbs.slice(0, pathIndex + 1))
        setFiles(targetFile.children)
        setSelectedFile(null)
      }
    }
  }

  if (loading) {
    return (
      <MainLayout>
        <div className="max-w-6xl mx-auto py-8 px-4">
          <div className="animate-pulse">Loading...</div>
        </div>
      </MainLayout>
    )
  }

  if (!project) {
    return null
  }

  return (
    <MainLayout>
      <div className="max-w-7xl mx-auto">
        <div className="border-b bg-background px-6 py-4">
          <div className="flex items-center gap-4 mb-4">
            <Button asChild variant="ghost" size="sm">
              <Link href={`/projects/${projectId}`}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Link>
            </Button>
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Code className="h-6 w-6" />
                <h1 className="text-2xl font-semibold">{project.name}</h1>
                <Badge variant="secondary" className="bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200">
                  Purchased
                </Badge>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm">
                <Star className="h-4 w-4 mr-2" />
                Star
              </Button>
              <Button variant="outline" size="sm">
                <GitFork className="h-4 w-4 mr-2" />
                Fork
              </Button>
              <Button size="sm">
                <Download className="h-4 w-4 mr-2" />
                Code
              </Button>
            </div>
          </div>
          
          <div className="flex items-center gap-6 mt-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <GitBranch className="h-4 w-4" />
              <span className="font-medium">{repoStats.branch}</span>
            </div>
            <span>{repoStats.totalCommits} commits</span>
            <span className="flex items-center gap-1">
              <span className="font-mono text-xs bg-muted px-1.5 py-0.5 rounded">{repoStats.lastCommitHash}</span>
              {repoStats.lastCommitMessage}
            </span>
            <span>{repoStats.lastCommit}</span>
          </div>
        </div>

        {currentPath && (
          <div className="px-6 py-2 border-b bg-muted/30">
            <div className="flex items-center gap-1 text-sm">
              <button 
                onClick={() => navigateToPath(-1)}
                className="text-blue-600 hover:underline"
              >
                {project.name}
              </button>
              {breadcrumbs.map((crumb, index) => (
                <span key={index} className="flex items-center gap-1">
                  <span>/</span>
                  <button 
                    onClick={() => navigateToPath(index)}
                    className="text-blue-600 hover:underline"
                  >
                    {crumb}
                  </button>
                </span>
              ))}
            </div>
          </div>
        )}

        {selectedFile ? (
          <div>
            <div className="flex items-center justify-between px-6 py-3 border-b bg-muted/30">
              <div className="flex items-center gap-2">
                <File className="h-4 w-4" />
                <span className="font-medium">{selectedFile.name}</span>
                <span className="text-sm text-muted-foreground">• {selectedFile.size}</span>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="sm" onClick={() => setSelectedFile(null)}>
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to files
                </Button>
                <Button variant="ghost" size="sm">
                  <Download className="h-4 w-4 mr-2" />
                  Download
                </Button>
              </div>
            </div>
            
            <div className="h-[600px] border-t">
              <Editor
                height="100%"
                language={getLanguageFromFile(selectedFile.name)}
                value={selectedFile.content || ''}
                theme={theme === 'dark' ? 'vs-dark' : 'vs'}
                options={{
                  readOnly: true,
                  minimap: { enabled: false },
                  scrollBeyondLastLine: false,
                  fontSize: 14,
                  lineNumbers: 'on',
                  renderWhitespace: 'selection',
                  automaticLayout: true,
                  wordWrap: 'on',
                  folding: true,
                  lineDecorationsWidth: 10,
                  lineNumbersMinChars: 3,
                  contextmenu: false,
                  selectOnLineNumbers: true
                }}
              />
            </div>
          </div>
        ) : (
          <div className="border border-border rounded-lg mx-6 my-6 overflow-hidden">
            <div className="bg-muted/50 px-4 py-3 border-b border-border">
              <div className="flex items-center gap-3 text-sm text-muted-foreground">
                <User className="h-4 w-4" />
                <span className="font-medium">{repoStats.author}</span>
                <span className="truncate max-w-md">{repoStats.lastCommitMessage}</span>
                <Clock className="h-4 w-4 ml-2" />
                <span>{repoStats.lastCommit}</span>
                <span className="font-mono text-xs bg-background px-1.5 py-0.5 rounded border">{repoStats.lastCommitHash}</span>
              </div>
            </div>
            
            <div className="bg-background">
              {files.map((file, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between px-4 py-2.5 hover:bg-muted/30 cursor-pointer transition-colors border-b border-border last:border-b-0"
                  onClick={() => handleFileClick(file)}
                >
                  <div className="flex items-center gap-3 flex-1">
                    {file.type === 'folder' ? (
                      <Folder className="h-4 w-4 text-blue-600 flex-shrink-0" />
                    ) : (
                      <File className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                    )}
                    <span className="font-medium text-blue-600 hover:underline text-sm">
                      {file.name}
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-6 text-xs text-muted-foreground">
                    <span className="hidden sm:block min-w-[120px] truncate">{file.commitMessage || 'Initial commit'}</span>
                    <span className="min-w-[80px] text-right">{file.lastModified}</span>
                    <span className="min-w-[60px] text-right font-mono">{file.size}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </MainLayout>
  )
}