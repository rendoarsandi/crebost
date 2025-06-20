export default function SimpleTest() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
      <div className="bg-white rounded-lg shadow-xl p-8 max-w-md">
        <h1 className="text-3xl font-bold text-gray-800 mb-4">Simple Test</h1>
        <p className="text-gray-600 mb-6">Testing if Tailwind CSS works without UI components.</p>
        
        <div className="space-y-4">
          <button className="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded transition-colors">
            Primary Button
          </button>
          <button className="w-full border border-gray-300 hover:bg-gray-50 text-gray-700 font-semibold py-2 px-4 rounded transition-colors">
            Secondary Button
          </button>
        </div>
        
        <div className="mt-6 p-4 bg-green-100 rounded-lg">
          <p className="text-green-800 text-sm">✅ If you can see this styled content, Tailwind CSS is working!</p>
        </div>
        
        <div className="mt-6 grid grid-cols-2 gap-4">
          <div className="p-4 bg-red-500 text-white rounded text-center">Red</div>
          <div className="p-4 bg-blue-500 text-white rounded text-center">Blue</div>
          <div className="p-4 bg-green-500 text-white rounded text-center">Green</div>
          <div className="p-4 bg-yellow-500 text-white rounded text-center">Yellow</div>
        </div>
      </div>
    </div>
  )
}
