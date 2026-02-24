import { ComplaintForm } from '../components/ComplaintForm';

export function Home() {
  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-blue-700 text-white p-6 rounded-t-lg">
        <h2 className="text-xl font-semibold">Important Information</h2>
        <ul className="mt-3 space-y-2 text-sm">
          <li className="flex items-start gap-2">
            <span className="text-blue-200">•</span>
            <span>Your complaint will be registered and a unique complaint number will be generated</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-blue-200">•</span>
            <span>You will receive email confirmation with complaint details</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-blue-200">•</span>
            <span>Cyber Crime Branch will be automatically notified</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-blue-200">•</span>
            <span>Keep your complaint number safe for tracking purposes</span>
          </li>
        </ul>
      </div>
      <ComplaintForm />
    </div>
  );
}
