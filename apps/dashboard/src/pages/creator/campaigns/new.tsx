import { GetServerSideProps } from 'next'
import { getServerSession } from 'next-auth'
import Head from 'next/head'
import { useState } from 'react'
import { useRouter } from 'next/router'
import { authOptions } from '../../../lib/auth'
import DashboardLayout from '../../../components/Layout/DashboardLayout'
import { SOCIAL_PLATFORMS, CONTENT_TYPES, convertUsdToIdr } from '@crebost/shared'

interface CampaignForm {
  title: string
  description: string
  budgetUsd: number
  ratePerViewerUsd: number
  targetViewers: number
  startDate: string
  endDate: string
  requirements: {
    platform: string
    minFollowers: number
    contentType: string[]
    hashtags: string[]
    description: string
  }[]
  materials: {
    type: 'image' | 'video' | 'text' | 'link'
    url: string
    description: string
  }[]
}

export default function NewCampaign() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [currentStep, setCurrentStep] = useState(1)
  const [formData, setFormData] = useState<CampaignForm>({
    title: '',
    description: '',
    budgetUsd: 1000,
    ratePerViewerUsd: 0.1,
    targetViewers: 10000,
    startDate: '',
    endDate: '',
    requirements: [{
      platform: 'TIKTOK',
      minFollowers: 1000,
      contentType: ['POST'],
      hashtags: [],
      description: '',
    }],
    materials: [{
      type: 'text',
      url: '',
      description: '',
    }],
  })

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }))
  }

  const addRequirement = () => {
    setFormData(prev => ({
      ...prev,
      requirements: [...prev.requirements, {
        platform: 'TIKTOK',
        minFollowers: 1000,
        contentType: ['POST'],
        hashtags: [],
        description: '',
      }],
    }))
  }

  const removeRequirement = (index: number) => {
    setFormData(prev => ({
      ...prev,
      requirements: prev.requirements.filter((_, i) => i !== index),
    }))
  }

  const updateRequirement = (index: number, field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      requirements: prev.requirements.map((req, i) => 
        i === index ? { ...req, [field]: value } : req
      ),
    }))
  }

  const addMaterial = () => {
    setFormData(prev => ({
      ...prev,
      materials: [...prev.materials, {
        type: 'text',
        url: '',
        description: '',
      }],
    }))
  }

  const removeMaterial = (index: number) => {
    setFormData(prev => ({
      ...prev,
      materials: prev.materials.filter((_, i) => i !== index),
    }))
  }

  const updateMaterial = (index: number, field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      materials: prev.materials.map((mat, i) => 
        i === index ? { ...mat, [field]: value } : mat
      ),
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      // Here you would make API call to create campaign
      console.log('Creating campaign:', formData)
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      router.push('/creator/campaigns')
    } catch (error) {
      console.error('Error creating campaign:', error)
    } finally {
      setLoading(false)
    }
  }

  const steps = [
    { id: 1, name: 'Basic Info', description: 'Campaign details and budget' },
    { id: 2, name: 'Requirements', description: 'Platform and content requirements' },
    { id: 3, name: 'Materials', description: 'Promotional materials and assets' },
    { id: 4, name: 'Review', description: 'Review and publish campaign' },
  ]

  return (
    <DashboardLayout>
      <Head>
        <title>Create New Campaign - Crebost</title>
      </Head>

      <div className="py-6">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 md:px-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-2xl font-semibold text-gray-900">Create New Campaign</h1>
            <p className="mt-1 text-sm text-gray-600">
              Set up your promotional campaign to reach more audience
            </p>
          </div>

          {/* Progress Steps */}
          <div className="mb-8">
            <nav aria-label="Progress">
              <ol className="flex items-center">
                {steps.map((step, stepIdx) => (
                  <li key={step.id} className={`${stepIdx !== steps.length - 1 ? 'pr-8 sm:pr-20' : ''} relative`}>
                    <div className="flex items-center">
                      <div className={`${
                        step.id < currentStep ? 'bg-indigo-600' :
                        step.id === currentStep ? 'bg-indigo-600' : 'bg-gray-300'
                      } h-8 w-8 rounded-full flex items-center justify-center`}>
                        {step.id < currentStep ? (
                          <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        ) : (
                          <span className="text-white text-sm font-medium">{step.id}</span>
                        )}
                      </div>
                      <div className="ml-4">
                        <div className={`text-sm font-medium ${
                          step.id <= currentStep ? 'text-indigo-600' : 'text-gray-500'
                        }`}>
                          {step.name}
                        </div>
                        <div className="text-sm text-gray-500">{step.description}</div>
                      </div>
                    </div>
                    {stepIdx !== steps.length - 1 && (
                      <div className="hidden sm:block absolute top-4 left-4 -ml-px mt-0.5 h-full w-0.5 bg-gray-300" />
                    )}
                  </li>
                ))}
              </ol>
            </nav>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Step 1: Basic Info */}
            {currentStep === 1 && (
              <div className="bg-white shadow rounded-lg p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-6">Campaign Basic Information</h3>
                
                <div className="grid grid-cols-1 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Campaign Title
                    </label>
                    <input
                      type="text"
                      required
                      className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                      value={formData.title}
                      onChange={(e) => handleInputChange('title', e.target.value)}
                      placeholder="Enter campaign title"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Description
                    </label>
                    <textarea
                      rows={4}
                      required
                      className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                      value={formData.description}
                      onChange={(e) => handleInputChange('description', e.target.value)}
                      placeholder="Describe your campaign goals and target audience"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Budget (USD)
                      </label>
                      <input
                        type="number"
                        min="100"
                        max="10000"
                        required
                        className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                        value={formData.budgetUsd}
                        onChange={(e) => handleInputChange('budgetUsd', Number(e.target.value))}
                      />
                      <p className="mt-1 text-sm text-gray-500">
                        ≈ {convertUsdToIdr(formData.budgetUsd).toLocaleString()} IDR
                      </p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Rate per View (USD)
                      </label>
                      <input
                        type="number"
                        min="0.01"
                        max="1"
                        step="0.01"
                        required
                        className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                        value={formData.ratePerViewerUsd}
                        onChange={(e) => handleInputChange('ratePerViewerUsd', Number(e.target.value))}
                      />
                      <p className="mt-1 text-sm text-gray-500">
                        ≈ {convertUsdToIdr(formData.ratePerViewerUsd).toLocaleString()} IDR
                      </p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Target Views
                      </label>
                      <input
                        type="number"
                        min="100"
                        required
                        className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                        value={formData.targetViewers}
                        onChange={(e) => handleInputChange('targetViewers', Number(e.target.value))}
                      />
                      <p className="mt-1 text-sm text-gray-500">
                        Max budget: ${(formData.ratePerViewerUsd * formData.targetViewers).toFixed(2)}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Start Date
                      </label>
                      <input
                        type="datetime-local"
                        required
                        className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                        value={formData.startDate}
                        onChange={(e) => handleInputChange('startDate', e.target.value)}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        End Date
                      </label>
                      <input
                        type="datetime-local"
                        required
                        className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                        value={formData.endDate}
                        onChange={(e) => handleInputChange('endDate', e.target.value)}
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="flex justify-between">
              <button
                type="button"
                onClick={() => setCurrentStep(Math.max(1, currentStep - 1))}
                disabled={currentStep === 1}
                className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>

              {currentStep < 4 ? (
                <button
                  type="button"
                  onClick={() => setCurrentStep(Math.min(4, currentStep + 1))}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
                >
                  Next
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={loading}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50"
                >
                  {loading ? 'Creating...' : 'Create Campaign'}
                </button>
              )}
            </div>
          </form>
        </div>
      </div>
    </DashboardLayout>
  )
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  const session = await getServerSession(context.req, context.res, authOptions)

  if (!session) {
    return {
      redirect: {
        destination: `${process.env.NEXT_PUBLIC_AUTH_URL}/signin`,
        permanent: false,
      },
    }
  }

  if (session.user.role !== 'CREATOR' && session.user.role !== 'ADMIN') {
    return {
      redirect: {
        destination: '/unauthorized',
        permanent: false,
      },
    }
  }

  return {
    props: {
      session,
    },
  }
}
