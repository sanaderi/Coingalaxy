// import { getApiDocs } from '@/lib/swagger'
// import ReactSwagger from './react-swagger'

export default async function IndexPage() {
  // const spec = await getApiDocs()
  return (
    <section className="container">
      <h1 className="text-2xl mt-10 font-bold">
        You can use this document to connect service
      </h1>
      {/* <ReactSwagger spec={spec} /> */}
    </section>
  )
}
