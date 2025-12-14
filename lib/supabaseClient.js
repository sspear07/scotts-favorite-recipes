
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://zhvoqognipbdigbghgsq.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inpodm9xb2duaXBiZGlnYmdoZ3NxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU2NDQ4MDMsImV4cCI6MjA4MTIyMDgwM30.lSkS2CoMMrqtu3ASx2OG36aJKHvVZOErsNfbQ14AHfE'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
