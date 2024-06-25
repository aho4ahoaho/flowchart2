import styled from "@emotion/styled";

export function Main() {
  return (
    <Text>Hello World</Text>
  );
}

const Text = styled.p({
  color: 'red',
  "&:hover": {
    color: 'blue'
  }
})