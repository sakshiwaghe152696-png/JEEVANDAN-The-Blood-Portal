export default function Stats() {
  return (
    <section className="py-20 px-10 text-center">
      <div className="grid md:grid-cols-3 gap-6">
        <div>
          <h4 className="text-3xl font-bold text-red-600">25+</h4>
          <p>Blood Banks</p>
        </div>
        <div>
          <h4 className="text-3xl font-bold text-red-600">1200+</h4>
          <p>Donors</p>
        </div>
        <div>
          <h4 className="text-3xl font-bold text-red-600">10+</h4>
          <p>Cities</p>
        </div>
      </div>
    </section>
  );
}
