/* Thanks Toska for the code :D */

import React from 'react'
import ReactMarkdown from 'react-markdown'
import remarkBreaks from 'remark-breaks'
import { Link, Typography } from '@mui/material'

const GutterTypography = ({ ...rest }) => <Typography {...rest} />

const H1 = ({ ...rest }) => (
  <GutterTypography variant="h4" component="h1" {...rest} />
)

const H2 = ({ ...rest }) => (
  <GutterTypography variant="h5" component="h2" {...rest} />
)

const H3 = ({ ...rest }) => (
  <GutterTypography variant="h6" component="h3" {...rest} />
)

const H4 = ({ ...rest }) => (
  <GutterTypography variant="body1" component="h4" {...rest} />
)

const A = ({ ...rest }) => <Link color="inherit" {...rest} />

const defaultComponents = {
  p: GutterTypography,
  a: A,
  h1: H1,
  h2: H2,
  h3: H3,
  h4: H4,
}

interface MarkdownProps {
  children: string
}

const Markdown = ({ children, ...props }: MarkdownProps) => {
  if (!children) return null

  const content = children.replace(/\n/gi, '&nbsp; \n')

  return (
    <ReactMarkdown
      remarkPlugins={[remarkBreaks]}
      components={{ ...defaultComponents }}
      {...props}
    >
      {content}
    </ReactMarkdown>
  )
}

export default Markdown
