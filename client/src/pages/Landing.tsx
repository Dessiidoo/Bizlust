export default function Landing() {
  return (
    <div>
      <h1>Simple Test Page</h1>
      <p>If you can see this content duplicated, there's a React rendering issue.</p>
      <div style={{height: '200vh', background: 'linear-gradient(to bottom, red, blue)'}}>
        <p>Scroll down to see if this content repeats</p>
      </div>
    </div>
  );
}