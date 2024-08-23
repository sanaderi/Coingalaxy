import Head from 'next/head'
import Image from 'next/image'

export default function Home() {
  return (
    <div>
      <Head>About us</Head>

      <div className="min-h-screen  py-12">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl font-bold text-center text-white-800 mb-6">
            About Us
          </h1>
          <p className="text-lg text-white-600 text-center max-w-2xl mx-auto mb-8">
            We are a team of passionate individuals dedicated to creating
            amazing digital experiences. Our goal is to provide top-notch
            services and solutions that exceed our clients' expectations.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="border border-white-800 p-6 rounded-lg shadow-lg">
              <h2 className="text-xl font-semibold text-white-800 mb-4">
                Our Mission
              </h2>
              <p className="text-white-600">
                Our mission is to revolutionize the digital world by delivering
                innovative and quality-driven solutions to our clients.
              </p>
            </div>

            <div className=" border border-white-800 p-6 rounded-lg shadow-lg">
              <h2 className="text-xl font-semibold text-white-800 mb-4">
                Our Values
              </h2>
              <p className="text-white-600">
                We believe in integrity, innovation, and customer satisfaction.
                These values drive everything we do and inspire us to push the
                boundaries.
              </p>
            </div>

            <div className="border border-white-800 p-6 rounded-lg shadow-lg">
              <h2 className="text-xl font-semibold text-white-800 mb-4">
                Our Vision
              </h2>
              <p className="text-white-600">
                Our vision is create a Free and opensource crypto gateway
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
