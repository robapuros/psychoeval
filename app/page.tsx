import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-4xl text-center">
        <h1 className="text-5xl font-bold text-gray-900 mb-4">
          PsicoEval
        </h1>
        <p className="text-xl text-gray-600 mb-8">
          Streamlined mental health assessment questionnaires for professionals
        </p>
        
        <div className="flex gap-4 justify-center mb-12">
          <Link
            href="/login"
            className="px-8 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors"
          >
            Professional Login
          </Link>
          <Link
            href="/register"
            className="px-8 py-3 bg-white text-blue-600 border-2 border-blue-600 rounded-lg font-semibold hover:bg-blue-50 transition-colors"
          >
            Sign Up
          </Link>
        </div>

        <div className="grid md:grid-cols-3 gap-6 text-left">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              📋 Validated Instruments
            </h3>
            <p className="text-gray-600">
              PHQ-9, GAD-7, PCL-5, AUDIT, and MMSE - clinically validated and ready to use
            </p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              📱 Mobile-Optimized
            </h3>
            <p className="text-gray-600">
              Patients complete assessments on any device with a simple, touch-friendly interface
            </p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              ⚡ Automatic Scoring
            </h3>
            <p className="text-gray-600">
              Instant results with severity levels and critical item alerts
            </p>
          </div>
        </div>

        <div className="mt-12 text-sm text-gray-500">
          <p>🔒 HIPAA-ready architecture | 📊 Evidence-based instruments | 🚀 Fast & reliable</p>
        </div>
      </div>
    </div>
  );
}
