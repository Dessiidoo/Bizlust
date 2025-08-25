export default function Landing() {
  console.log("Landing component rendered");
  
  return (
    <div style={{padding: '20px', maxHeight: '100vh', overflow: 'hidden'}}>
      <h1>Landing Page Test</h1>
      <p>Page should be exactly this size - no duplication</p>
      <div style={{
        width: '100%', 
        height: '200px', 
        background: 'lightblue',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <span>Single content block</span>
      </div>
    </div>
  );
}