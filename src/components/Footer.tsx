export function Footer() {
  return (
    <footer className="bg-gray-800 text-gray-300 mt-12">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="text-white font-semibold mb-3">Emergency Helpline</h3>
            <p className="text-2xl font-bold text-blue-400">1930</p>
            <p className="text-sm mt-2">24x7 Cyber Crime Helpline</p>
          </div>
          <div>
            <h3 className="text-white font-semibold mb-3">Important Links</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <a href="#" className="hover:text-blue-400 transition">
                  Track Your Complaint
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-blue-400 transition">
                  Cyber Safety Tips
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-blue-400 transition">
                  FAQs
                </a>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="text-white font-semibold mb-3">Contact Information</h3>
            <p className="text-sm">National Cyber Crime Reporting Portal</p>
            <p className="text-sm mt-2">Ministry of Home Affairs</p>
            <p className="text-sm">Government of India</p>
          </div>
        </div>
        <div className="border-t border-gray-700 mt-8 pt-6 text-center text-sm">
          <p>
            &copy; {new Date().getFullYear()} Cyber Crime Complaint Portal. All rights
            reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
