import React from "react";
import { Container, Row, Col } from "react-bootstrap";

function Home() {
  return (
    <section>
      <Container fluid className="home-section" id="home">
       
        <Container className="home-content">
          <Row>
            <Col md={7} className="home-header">
              <h1 style={{ paddingBottom: 15 }} className="heading">
                Our main page
              </h1>

             
              
            </Col>

            
          </Row>
        </Container>
      </Container>
    
    </section>
  );
}

export default Home;
