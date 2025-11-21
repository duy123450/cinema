import Header from "../components/Header.jsx";
import Banner from "../components/Banner.jsx";
import Footer from "../components/Footer.jsx";

function Index() {
  return (
    <>
      <Header />
      <Banner />
      <section className="now-playing">
        <h2>Now Playing</h2>
        <div className="movie-grid">
          
        </div>
      </section>
      <Footer />
    </>
  );
}

export default Index;
