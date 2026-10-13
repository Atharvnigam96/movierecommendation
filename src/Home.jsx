import Hero from "./Hero";
import Recommended from "./Recommended";
import Trending from "./Trending";

function Home({ search = "", myList = [], onAddToList }) {
  return (
    <div>
      <Hero />

      <Recommended
        search={search}
        myList={myList}
        onAddToList={onAddToList}
      />

      <Trending
        myList={myList}
        onAddToList={onAddToList}
      />
    </div>
  );
}

export default Home;