export const supabase = {
  from: (table: string) => ({
    select: (columns?: string) => ({
      eq: (column: string, value: any) => ({
        order: (column: string, options?: any) => ({
          range: (start: number, end: number) => Promise.resolve({ data: [], error: null }),
        })
      })
    }),
    insert: (data: any) => ({
      select: () => ({
        single: () => Promise.resolve({ data: { id: '1', ...data }, error: null }),
      })
    }),
    update: (data: any) => ({
      eq: (column: string, value: any) => Promise.resolve({ error: null }),
    }),
    delete: () => ({
      eq: (column: string, value: any) => Promise.resolve({ error: null }),
    })
  }),
  auth: {
    getSession: () => Promise.resolve({ data: { session: null }, error: null }),
    onAuthStateChange: (callback: any) => {
      return { data: { subscription: { unsubscribe: () => {} } } };
    },
    signUp: (data: any) => Promise.resolve({ 
      data: { user: { id: '1', email: data.email, user_metadata: { name: data.name } } }, 
      error: null 
    }),
    signInWithPassword: (data: any) => Promise.resolve({ 
      data: { 
        user: { id: '1', email: data.email, user_metadata: { name: 'Test User' } } 
      }, // This closing brace was missing!
      session: { 
        user: { id: '1', email: data.email, user_metadata: { name: 'Test User' } } 
      }, 
      error: null 
    }),
    signOut: () => Promise.resolve({ error: null }),
    updateUser: (data: any) => Promise.resolve({ data: { user: null }, error: null }),
  }
};