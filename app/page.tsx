'use client'
import { z } from 'zod'

import { useEffect, useState } from 'react'
import HelpStep1 from './components/home/Step1'
import HelpStep2 from './components/home/Step2'
import HelpStep3 from './components/home/Step3'

export default function Home() {
  const formSchema = z.object({
    destination: z
      .string({ required_error: 'Destination is required' })
      .min(5, { message: 'Destination must be more than 5 characters' })
      .max(500, { message: 'Destination must be less than 500 characters' })
      .trim(),
    value: z.coerce
      .number({ required_error: 'Value is required' })
      .min(1, { message: 'Value should be more than 0' })
  })
  type FormSchema = z.infer<typeof formSchema>

  const [formValues, setFormValues] = useState<z.infer<typeof formSchema>>({
    destination: 'CqsrMXftjq31vNRBwJJZZqLX9tGYhV5wgrxAYemV4fyJ',
    value: 1
  })

  const [step, setStep] = useState(3)
  const [isLoading, setIsLoading] = useState(false)

  return (
    <>
      {step === 1 && <HelpStep1 setStep={setStep} />}
      {step === 2 && <HelpStep2 setStep={setStep} />}
      {step === 3 && <HelpStep3 setStep={setStep} />}
    </>
  )
}
