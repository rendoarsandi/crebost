import Head from 'next/head'
import { Button } from '@crebost/ui'
import { Card, CardContent, CardHeader, CardTitle } from '@crebost/ui'
import { Badge } from '@crebost/ui'
import { ThemeToggle } from '@crebost/ui'

export default function Test() {
  return (
    <>
      <Head>
        <title>Test Page - Crebost</title>
        <meta name="description" content="Test page for styling" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <main className="min-h-screen bg-background text-foreground">
        <section className="py-20 px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl font-bold text-primary mb-4">
              Test Crebost Landing Page
            </h1>
            <p className="text-xl text-muted-foreground mb-8">
              Testing styling and components
            </p>
            
            <div className="space-x-4 mb-8">
              <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
                Primary Button
              </Button>
              <Button variant="outline">
                Secondary Button
              </Button>
            </div>
            
            <div className="mt-12 grid md:grid-cols-2 gap-6">
              <Card className="border border-border bg-card">
                <CardHeader>
                  <CardTitle className="text-card-foreground">Test Card 1</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-card-foreground">This is a test card to check if styling works.</p>
                </CardContent>
              </Card>
              
              <Card className="border border-border bg-card">
                <CardHeader>
                  <CardTitle className="text-card-foreground">Test Card 2</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-card-foreground mb-4">Another test card with different content.</p>
                  <Badge className="bg-primary text-primary-foreground">Test Badge</Badge>
                </CardContent>
              </Card>
            </div>
            
            <div className="mt-8">
              <ThemeToggle />
            </div>
            
            <div className="mt-8 p-6 bg-secondary rounded-lg">
              <h2 className="text-2xl font-semibold text-secondary-foreground mb-4">
                Color Test
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="p-4 bg-primary text-primary-foreground rounded">Primary</div>
                <div className="p-4 bg-secondary text-secondary-foreground rounded">Secondary</div>
                <div className="p-4 bg-muted text-muted-foreground rounded">Muted</div>
                <div className="p-4 bg-accent text-accent-foreground rounded">Accent</div>
              </div>
            </div>
          </div>
        </section>
      </main>
    </>
  )
}
