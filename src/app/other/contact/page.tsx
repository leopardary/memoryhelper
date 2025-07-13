export default function Contact() {
  return (
    <div className="bg-white text-gray-800 leading-relaxed">
<div className="max-w-3xl mx-auto px-6 py-12">
    <h1 className="text-3xl font-bold mb-6">Contact Us</h1>

    <p className="mb-4">We would love to hear from you. If you have questions, feedback, or encounter any issues with MemoryHelper, please reach out to us.</p>

    <h2 className="text-2xl font-semibold mt-10 mb-4">Email</h2>
    <p className="mb-4">You can contact us directly at:  
      <a href="mailto:yourmemoryhelper@gmail.com" className="text-blue-600 hover:underline">yourmemoryhelper@gmail.com</a>
    </p>

    <h2 className="text-2xl font-semibold mt-10 mb-4">Contact Form (Optional)</h2>
    <form action="#" method="POST" className="space-y-4">
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-gray-700">Name</label>
        <input type="text" id="name" name="name" required className="w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-500" />
      </div>
      <div>
        <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
        <input type="email" id="email" name="email" required className="w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-500" />
      </div>
      <div>
        <label htmlFor="message" className="block text-sm font-medium text-gray-700">Message</label>
        <textarea id="message" name="message" rows={5} required className="w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"></textarea>
      </div>
      <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition">Send Message</button>
    </form>

    <p className="text-sm text-gray-500 mt-6">Please allow 1-3 business days for a response.</p>
  </div>
  </div>
  )
}