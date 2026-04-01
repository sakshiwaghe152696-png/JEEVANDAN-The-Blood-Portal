export default function Hero() {
  return (
    <section className="bg-red-50 py-24 px-10 text-center">
      <h2 className="text-4xl font-bold mb-4">
        Smart Blood Availability System
      </h2>
      <p className="text-gray-600 mb-8">
        Connecting donors, doctors and blood banks at the right time.
      </p>

      <div className="flex justify-center gap-4">
        <button className="bg-red-600 text-white px-6 py-3 rounded">
          Get Started
        </button>
        <button className="border border-red-600 text-red-600 px-6 py-3 rounded">
          Become a Donor
        </button>
      </div>
    </section>
  );
}
