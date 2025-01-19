export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      pages: {
        Row: {
          id: string
          slug: string
          title: string
          content: string
          updated_at: string
        }
        Insert: {
          id?: string
          slug: string
          title: string
          content: string
          updated_at?: string
        }
        Update: {
          id?: string
          slug?: string
          title?: string
          content?: string
          updated_at?: string
        }
      }
      blog_posts: {
        Row: {
          id: string
          slug: string
          title: string
          content: string
          date: string
          published: boolean
          created_at: string
        }
        Insert: {
          id?: string
          slug: string
          title: string
          content: string
          date?: string
          published?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          slug?: string
          title?: string
          content?: string
          date?: string
          published?: boolean
          created_at?: string
        }
      }
      books: {
        Row: {
          id: string
          title: string
          author: string
          url: string
          order: number
        }
        Insert: {
          id?: string
          title: string
          author: string
          url: string
          order?: number
        }
        Update: {
          id?: string
          title?: string
          author?: string
          url?: string
          order?: number
        }
      }
      links: {
        Row: {
          id: string
          title: string
          url: string
          description: string | null
          category: string
          order: number
        }
        Insert: {
          id?: string
          title: string
          url: string
          description?: string | null
          category: string
          order?: number
        }
        Update: {
          id?: string
          title?: string
          url?: string
          description?: string | null
          category?: string
          order?: number
        }
      }
    }
  }
}