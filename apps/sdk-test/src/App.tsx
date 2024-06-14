import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { GeneratePdfButton } from './GeneratePdfButton'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false
    }
  }
})

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <GeneratePdfButton/>
    </QueryClientProvider>
  )
}

export default App
