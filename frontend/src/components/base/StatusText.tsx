import styled from 'styled-components'

const Error = styled.p`
  color: red;
`

const Success = styled.p`
  color: green;
`

export type StatusTextProps = { isError: boolean, text: string }

const StatusText: React.FC<{ status?: StatusTextProps }> = ({ status }) => {
  if (!status) return null
  if (status.isError) return <Error>{status.text}</Error>
  return <Success>{status.text}</Success>
}

export default StatusText
