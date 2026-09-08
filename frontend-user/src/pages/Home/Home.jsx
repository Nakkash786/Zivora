import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../../services/api";
import "./Home.css";

const BACKEND_URL = "http://127.0.0.1:8000";

const getImageUrl = (image) => {
  if (!image) return "";

  if (
    image.startsWith("http://") ||
    image.startsWith("https://")
  ) {
    return image;
  }

  return `${BACKEND_URL}${image}`;
};

const getData = (response) => {
  if (Array.isArray(response.data)) {
    return response.data;
  }

  return response.data?.results || [];
};


function Home() {

  /* =========================================================
     HOME DATA
  ========================================================= */

  const [banners, setBanners] = useState([]);
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [newArrivals, setNewArrivals] = useState([]);
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);


  /* =========================================================
     UI STATE
  ========================================================= */

  const [currentBanner, setCurrentBanner] = useState(0);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");


  /* =========================================================
     LOAD HOME DATA
  ========================================================= */

  useEffect(() => {

    const loadHomeData = async () => {

      try {

        setLoading(true);

        setError("");


        const [
          bannersResponse,
          featuredResponse,
          newArrivalsResponse,
          categoriesResponse,
          brandsResponse,
        ] = await Promise.all([

          api.get("/products/banners/"),

          api.get(
            "/products/products/?featured=true"
          ),

          api.get(
            "/products/products/?new_arrival=true"
          ),

          api.get(
            "/products/categories/"
          ),

          api.get(
            "/products/brands/"
          ),

        ]);


        setBanners(
          getData(bannersResponse)
        );

        setFeaturedProducts(
          getData(featuredResponse)
        );

        setNewArrivals(
          getData(newArrivalsResponse)
        );

        setCategories(
          getData(categoriesResponse)
        );

        setBrands(
          getData(brandsResponse)
        );


      } catch (err) {

        console.error(
          "Home data error:",
          err
        );

        setError(
          "Unable to load homepage data."
        );

      } finally {

        setLoading(false);

      }
    };


    loadHomeData();

  }, []);


  /* =========================================================
     RESET BANNER INDEX
  ========================================================= */

  useEffect(() => {

    if (
      currentBanner >= banners.length &&
      banners.length > 0
    ) {

      setCurrentBanner(0);

    }

  }, [
    banners.length,
    currentBanner,
  ]);


  /* =========================================================
     AUTO BANNER SLIDER
  ========================================================= */

  useEffect(() => {

    if (banners.length <= 1) {
      return;
    }


    const interval = setInterval(() => {

      setCurrentBanner(
        (previous) =>
          (previous + 1) % banners.length
      );

    }, 5000);


    return () => {
      clearInterval(interval);
    };

  }, [banners.length]);


  /* =========================================================
     PREVIOUS BANNER
  ========================================================= */

  const showPreviousBanner = () => {

    if (banners.length === 0) {
      return;
    }


    setCurrentBanner(
      (previous) =>
        previous === 0
          ? banners.length - 1
          : previous - 1
    );

  };


  /* =========================================================
     NEXT BANNER
  ========================================================= */

  const showNextBanner = () => {

    if (banners.length === 0) {
      return;
    }


    setCurrentBanner(
      (previous) =>
        (previous + 1) % banners.length
    );

  };


  /* =========================================================
     ACTIVE BANNER
  ========================================================= */

  const activeBanner =
    banners[currentBanner];


  return (
    <main className="home-page">


      {/* =====================================================
          HERO BANNER
      ===================================================== */}

      <section className="hero-section">

        {activeBanner ? (

          <div className="hero-banner">

            {/* -----------------------------------------------
                BANNER IMAGE
            ----------------------------------------------- */}

            <img
              src={getImageUrl(
                activeBanner.image
              )}
              alt={
                activeBanner.title ||
                "Zivora Fashion Banner"
              }
              className="hero-banner-image"
            />


            {/* -----------------------------------------------
                BANNER CONTENT
            ----------------------------------------------- */}

            <div className="hero-overlay">

              <div className="hero-content">

                <p className="hero-small-text">
                  ZIVORA
                </p>


                <h1>
                  {activeBanner.title}
                </h1>


                {activeBanner.subtitle && (

                  <p className="hero-subtitle">
                    {activeBanner.subtitle}
                  </p>

                )}


                {activeBanner.button_text && (

                  <Link
                    to={
                      activeBanner.button_link ||
                      "/products"
                    }
                    className="hero-button"
                  >
                    {activeBanner.button_text}
                  </Link>

                )}

              </div>

            </div>


            {/* -----------------------------------------------
                PREVIOUS BUTTON
            ----------------------------------------------- */}

            {banners.length > 1 && (

              <button
                type="button"
                className="hero-slider-button hero-slider-prev"
                onClick={
                  showPreviousBanner
                }
                aria-label="Previous banner"
              >
                ‹
              </button>

            )}


            {/* -----------------------------------------------
                NEXT BUTTON
            ----------------------------------------------- */}

            {banners.length > 1 && (

              <button
                type="button"
                className="hero-slider-button hero-slider-next"
                onClick={
                  showNextBanner
                }
                aria-label="Next banner"
              >
                ›
              </button>

            )}


            {/* -----------------------------------------------
                BANNER DOTS
            ----------------------------------------------- */}

            {banners.length > 1 && (

              <div className="hero-slider-dots">

                {banners.map(
                  (banner, index) => (

                    <button
                      key={banner.id}
                      type="button"
                      className={
                        index === currentBanner
                          ? "hero-dot hero-dot-active"
                          : "hero-dot"
                      }
                      onClick={() =>
                        setCurrentBanner(index)
                      }
                      aria-label={`Go to banner ${
                        index + 1
                      }`}
                    />

                  )
                )}

              </div>

            )}

          </div>

        ) : (

          /* =================================================
             FALLBACK HERO
          ================================================= */

          <div className="hero-empty">

            <div className="hero-content">

              <p className="hero-small-text">
                ZIVORA
              </p>

              <h1>
                Discover Your Style
              </h1>

              <p className="hero-subtitle">
                Fashion that matches your personality.
              </p>

              <Link
                to="/products"
                className="hero-button"
              >
                Shop Now
              </Link>

            </div>

          </div>

        )}

      </section>


      {/* =====================================================
          ERROR
      ===================================================== */}

      {error && (

        <div className="home-error">
          {error}
        </div>

      )}


      {/* =====================================================
          LOADING
      ===================================================== */}

      {loading ? (

        <div className="home-loading">
          Loading...
        </div>

      ) : (

        <>


          {/* =================================================
              CATEGORIES
          ================================================= */}

          {categories.length > 0 && (

            <section className="home-section">

              <div className="section-heading">

                <p>
                  EXPLORE
                </p>

                <h2>
                  Shop By Category
                </h2>

              </div>


              <div className="category-grid">

                {categories.map(
                  (category) => (

                    <Link
                      to={`/products?category=${category.id}`}
                      className="category-card"
                      key={category.id}
                    >

                      <div className="category-image-wrapper">

                        {category.image ? (

                          <img
                            src={getImageUrl(
                              category.image
                            )}
                            alt={category.name}
                          />

                        ) : (

                          <div className="no-image">
                            No Image
                          </div>

                        )}

                      </div>


                      <div className="category-info">

                        <h3>
                          {category.name}
                        </h3>


                        {category.description && (

                          <p>
                            {category.description}
                          </p>

                        )}

                      </div>

                    </Link>

                  )
                )}

              </div>

            </section>

          )}


          {/* =================================================
              FEATURED PRODUCTS
          ================================================= */}

          {featuredProducts.length > 0 && (

            <section className="home-section">

              <div className="section-heading">

                <p>
                  CURATED FOR YOU
                </p>

                <h2>
                  Featured Collection
                </h2>

              </div>


              <div className="product-grid">

                {featuredProducts.map(
                  (product) => (

                    <Link
                      to={`/products/${product.slug}`}
                      className="home-product-card"
                      key={product.id}
                    >

                      <div className="product-image-wrapper">

                        {product.main_image ? (

                          <img
                            src={getImageUrl(
                              product.main_image
                            )}
                            alt={product.name}
                          />

                        ) : (

                          <div className="no-image">
                            No Image
                          </div>

                        )}


                        {product.discount_percentage > 0 && (

                          <span className="discount-badge">
                            {
                              product.discount_percentage
                            }% OFF
                          </span>

                        )}

                      </div>


                      <div className="product-info">

                        <p className="product-brand">
                          {product.brand_name}
                        </p>


                        <h3>
                          {product.name}
                        </h3>


                        <div className="product-price">

                          <span className="sale-price">
                            ₹{product.final_price}
                          </span>


                          {product.discount_price && (

                            <span className="original-price">
                              ₹{product.price}
                            </span>

                          )}

                        </div>

                      </div>

                    </Link>

                  )
                )}

              </div>


              <div className="view-all-wrapper">

                <Link
                  to="/products"
                  className="view-all-button"
                >
                  View All Products
                </Link>

              </div>

            </section>

          )}


          {/* =================================================
              NEW ARRIVALS
          ================================================= */}

          {newArrivals.length > 0 && (

            <section className="home-section">

              <div className="section-heading">

                <p>
                  JUST DROPPED
                </p>

                <h2>
                  New Arrivals
                </h2>

              </div>


              <div className="product-grid">

                {newArrivals.map(
                  (product) => (

                    <Link
                      to={`/products/${product.slug}`}
                      className="home-product-card"
                      key={product.id}
                    >

                      <div className="product-image-wrapper">

                        {product.main_image ? (

                          <img
                            src={getImageUrl(
                              product.main_image
                            )}
                            alt={product.name}
                          />

                        ) : (

                          <div className="no-image">
                            No Image
                          </div>

                        )}


                        {product.discount_percentage > 0 && (

                          <span className="discount-badge">
                            {
                              product.discount_percentage
                            }% OFF
                          </span>

                        )}

                      </div>


                      <div className="product-info">

                        <p className="product-brand">
                          {product.brand_name}
                        </p>


                        <h3>
                          {product.name}
                        </h3>


                        <div className="product-price">

                          <span className="sale-price">
                            ₹{product.final_price}
                          </span>


                          {product.discount_price && (

                            <span className="original-price">
                              ₹{product.price}
                            </span>

                          )}

                        </div>

                      </div>

                    </Link>

                  )
                )}

              </div>


              <div className="view-all-wrapper">

                <Link
                  to="/products"
                  className="view-all-button"
                >
                  Shop New Arrivals
                </Link>

              </div>

            </section>

          )}


          {/* =================================================
              BRANDS
          ================================================= */}

          {brands.length > 0 && (

            <section className="brands-section">

              <div className="section-heading">

                <p>
                  OUR COLLECTION
                </p>

                <h2>
                  Shop By Brand
                </h2>

              </div>


              <div className="brand-grid">

                {brands.map(
                  (brand) => (

                    <Link
                      to={`/products?brand=${brand.id}`}
                      className="brand-card"
                      key={brand.id}
                    >

                      {brand.logo ? (

                        <img
                          src={getImageUrl(
                            brand.logo
                          )}
                          alt={brand.name}
                        />

                      ) : (

                        <h3>
                          {brand.name}
                        </h3>

                      )}

                    </Link>

                  )
                )}

              </div>

            </section>

          )}

        </>

      )}

    </main>
  );
}


export default Home;