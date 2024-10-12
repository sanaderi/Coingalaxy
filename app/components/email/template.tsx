import * as React from 'react'

interface EmailTemplateProps {
  txt: string
}

export const EmailTemplate: React.FC<Readonly<EmailTemplateProps>> = ({
  txt
}) => (
  <div>
    <p>{txt}!</p>
  </div>
)
