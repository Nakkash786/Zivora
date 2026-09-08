import { useEffect, useState } from "react";
import {
  Link,
  useSearchParams,
} from "react-router-dom";

import api from "../../services/api";

import "./Products.css";

function Products() {

  // =========================================================
  // URL SEARCH PARAMS
  // =========================================================

  const [searchParams, setSearchParams] =
    useSearchParams();

  // =========================================================
  // PRODUCT STATES
  // =========================================================

  const [products, setProducts] = useState([]);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");

  // =========================================================
  // FILTER STATES
  // =========================================================

  const [search, setSearch] = useState(
    searchParams.get("search") || ""
  );

  const [gender, setGender] = useState(
    searchParams.get("gender") || ""
  );

  const [brand, setBrand] = useState(
    searchParams.get("brand") || ""
  );

  const [category, setCategory] = useState(
    searchParams.get("category") || ""
  );

  const [minPrice, setMinPrice] = useState(
    searchParams.get("min_price") || ""
  );

  const [maxPrice, setMaxPrice] = useState(
    searchParams.get("max_price") || ""
  );

  const [filtersOpen, setFiltersOpen] =
    useState(false);

  // =========================================================
  // BRAND / CATEGORY
  // =========================================================

  const [brands, setBrands] = useState([]);

  const [categories, setCategories] = useState([]);

  // =========================================================
  // IMAGE URL
  // =========================================================

  const getImageUrl = (image) => {

    if (!image) {
      return "";
    }

    if (image.startsWith("http")) {
      return image;
    }

    return `http://127.0.0.1:8000${image}`;
  };

  // =========================================================
  // FETCH PRODUCTS
  // =========================================================

  const fetchProducts = async (filters = {}) => {

    try {

      setLoading(true);

      setError("");

      const params = new URLSearchParams();

      if (filters.search) {
        params.append(
          "search",
          filters.search
        );
      }

      if (filters.gender) {
        params.append(
          "gender",
          filters.gender
        );
      }

      if (filters.brand) {
        params.append(
          "brand",
          filters.brand
        );
      }

      if (filters.category) {
        params.append(
          "category",
          filters.category
        );
      }

      if (filters.minPrice) {
        params.append(
          "min_price",
          filters.minPrice
        );
      }

      if (filters.maxPrice) {
        params.append(
          "max_price",
          filters.maxPrice
        );
      }

      const queryString = params.toString();

      const url = queryString
        ? `/products/products/?${queryString}`
        : "/products/products/";

      const response = await api.get(url);

      const data = response.data;

      if (Array.isArray(data)) {

        setProducts(data);

      } else if (Array.isArray(data.results)) {

        setProducts(data.results);

      } else {

        setProducts([]);

      }

    } catch (err) {

      console.error(
        "Products fetch error:",
        err
      );

      setError(
        err.response?.data?.detail ||
        "Unable to load products."
      );

      setProducts([]);

    } finally {

      setLoading(false);

    }
  };

  // =========================================================
  // FETCH BRANDS
  // =========================================================

  const fetchBrands = async () => {

    try {

      const response = await api.get(
        "/products/brands/"
      );

      const data = response.data;

      if (Array.isArray(data)) {

        setBrands(data);

      } else if (Array.isArray(data.results)) {

        setBrands(data.results);

      } else {

        setBrands([]);

      }

    } catch (err) {

      console.error(
        "Brands fetch error:",
        err
      );

    }
  };

  // =========================================================
  // FETCH CATEGORIES
  // =========================================================

  const fetchCategories = async () => {

    try {

      const response = await api.get(
        "/products/categories/"
      );

      const data = response.data;

      if (Array.isArray(data)) {

        setCategories(data);

      } else if (Array.isArray(data.results)) {

        setCategories(data.results);

      } else {

        setCategories([]);

      }

    } catch (err) {

      console.error(
        "Categories fetch error:",
        err
      );

    }
  };

  // =========================================================
  // URL → STATE + FETCH
  // =========================================================

  useEffect(() => {

    const urlGender =
      searchParams.get("gender") || "";

    const urlSearch =
      searchParams.get("search") || "";

    const urlBrand =
      searchParams.get("brand") || "";

    const urlCategory =
      searchParams.get("category") || "";

    const urlMinPrice =
      searchParams.get("min_price") || "";

    const urlMaxPrice =
      searchParams.get("max_price") || "";

    setGender(urlGender);
    setSearch(urlSearch);
    setBrand(urlBrand);
    setCategory(urlCategory);
    setMinPrice(urlMinPrice);
    setMaxPrice(urlMaxPrice);

    fetchProducts({

      gender: urlGender,

      search: urlSearch,

      brand: urlBrand,

      category: urlCategory,

      minPrice: urlMinPrice,

      maxPrice: urlMaxPrice,

    });

  }, [searchParams]);

  // =========================================================
  // BRANDS + CATEGORIES
  // =========================================================

  useEffect(() => {

    fetchBrands();

    fetchCategories();

  }, []);

  // =========================================================
  // APPLY FILTERS
  // =========================================================

  const handleApplyFilters = () => {

    const filters = {

      search: search.trim(),

      gender,

      brand,

      category,

      minPrice,

      maxPrice,

    };

    const params = {};

    if (filters.search) {
      params.search = filters.search;
    }

    if (filters.gender) {
      params.gender = filters.gender;
    }

    if (filters.brand) {
      params.brand = filters.brand;
    }

    if (filters.category) {
      params.category = filters.category;
    }

    if (filters.minPrice) {
      params.min_price = filters.minPrice;
    }

    if (filters.maxPrice) {
      params.max_price = filters.maxPrice;
    }

    setSearchParams(params);

    setFiltersOpen(false);
  };

  // =========================================================
  // RESET FILTERS
  // =========================================================

  const handleResetFilters = () => {

    setSearch("");
    setGender("");
    setBrand("");
    setCategory("");
    setMinPrice("");
    setMaxPrice("");

    setSearchParams({});

    setFiltersOpen(false);
  };

  // =========================================================
  // ACTIVE FILTER COUNT
  // =========================================================

  const activeFilterCount = [

    gender,
    brand,
    category,
    minPrice,
    maxPrice,

  ].filter(Boolean).length;

  // =========================================================
  // PAGE TITLE
  // =========================================================

  const getPageTitle = () => {

    if (search) {
      return `Search results for "${search}"`;
    }

    if (gender === "MEN") {
      return "Men's Collection";
    }

    if (gender === "WOMEN") {
      return "Women's Collection";
    }

    if (gender === "KIDS") {
      return "Kids Collection";
    }

    if (gender === "UNISEX") {
      return "Unisex Collection";
    }

    return "All Products";
  };

  // =========================================================
  // PAGE DESCRIPTION
  // =========================================================

  const getPageDescription = () => {

    if (search) {
      return "Explore products matching your search.";
    }

    if (gender === "MEN") {
      return "Discover the latest styles for men.";
    }

    if (gender === "WOMEN") {
      return "Discover the latest styles for women.";
    }

    if (gender === "KIDS") {
      return "Discover the latest styles for kids.";
    }

    if (gender === "UNISEX") {
      return "Discover styles designed for everyone.";
    }

    return "Discover the latest styles from Zivora.";
  };

  // =========================================================
  // LOADING
  // =========================================================

  if (loading) {

    return (

      <div className="products-loading">

        <div className="products-spinner"></div>

        <p>
          Loading products...
        </p>

      </div>

    );

  }

  // =========================================================
  // ERROR
  // =========================================================

  if (error) {

    return (

      <div className="products-error">

        <div className="products-error-icon">
          !
        </div>

        <h2>
          Something went wrong
        </h2>

        <p>
          {error}
        </p>

        <button
          onClick={() =>
            fetchProducts({
              search,
              gender,
              brand,
              category,
              minPrice,
              maxPrice,
            })
          }
        >
          Try Again
        </button>

      </div>

    );

  }

  return (

    <div className="products-page">

      {/* =====================================================
          PAGE HEADER
      ===================================================== */}

      <section className="products-header">

        <div className="products-header-content">

          <p className="products-eyebrow">
            ZIVORA COLLECTION
          </p>

          <h1>
            {getPageTitle()}
          </h1>

          <p className="products-description">
            {getPageDescription()}
          </p>

        </div>

      </section>

      {/* =====================================================
          MOBILE FILTER BUTTON
      ===================================================== */}

      <div className="mobile-filter-bar">

        <button
          type="button"
          className="mobile-filter-button"
          onClick={() =>
            setFiltersOpen(!filtersOpen)
          }
        >

          <span className="mobile-filter-button-left">

            <svg
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path d="M4 6h16M7 12h10M10 18h4" />
            </svg>

            Filters

            {activeFilterCount > 0 && (
              <span className="filter-count">
                {activeFilterCount}
              </span>
            )}

          </span>

          <span>
            {filtersOpen ? "−" : "+"}
          </span>

        </button>

      </div>

      {/* =====================================================
          MAIN CONTENT
      ===================================================== */}

      <div className="products-layout">

        {/* ===================================================
            FILTER SIDEBAR
        =================================================== */}

        <aside
          className={`products-filters ${
            filtersOpen
              ? "filters-mobile-open"
              : ""
          }`}
        >

          <div className="filters-header">

            <div>

              <p className="filters-eyebrow">
                REFINE
              </p>

              <h2>
                Filters
              </h2>

            </div>

            <button
              type="button"
              onClick={handleResetFilters}
            >
              Clear
            </button>

          </div>

          {/* =================================================
              GENDER
          ================================================= */}

          <div className="filter-group">

            <label>
              Gender
            </label>

            <select
              value={gender}
              onChange={(event) =>
                setGender(event.target.value)
              }
            >

              <option value="">
                All
              </option>

              <option value="MEN">
                Men
              </option>

              <option value="WOMEN">
                Women
              </option>

              <option value="UNISEX">
                Unisex
              </option>

              <option value="KIDS">
                Kids
              </option>

            </select>

          </div>

          {/* =================================================
              BRAND
          ================================================= */}

          <div className="filter-group">

            <label>
              Brand
            </label>

            <select
              value={brand}
              onChange={(event) =>
                setBrand(event.target.value)
              }
            >

              <option value="">
                All Brands
              </option>

              {brands.map((item) => (

                <option
                  key={item.id}
                  value={item.id}
                >
                  {item.name}
                </option>

              ))}

            </select>

          </div>

          {/* =================================================
              CATEGORY
          ================================================= */}

          <div className="filter-group">

            <label>
              Category
            </label>

            <select
              value={category}
              onChange={(event) =>
                setCategory(event.target.value)
              }
            >

              <option value="">
                All Categories
              </option>

              {categories.map((item) => (

                <option
                  key={item.id}
                  value={item.id}
                >
                  {item.name}
                </option>

              ))}

            </select>

          </div>

          {/* =================================================
              PRICE
          ================================================= */}

          <div className="filter-group">

            <label>
              Price Range
            </label>

            <div className="price-inputs">

              <input
                type="number"
                min="0"
                placeholder="Min"
                value={minPrice}
                onChange={(event) =>
                  setMinPrice(event.target.value)
                }
              />

              <input
                type="number"
                min="0"
                placeholder="Max"
                value={maxPrice}
                onChange={(event) =>
                  setMaxPrice(event.target.value)
                }
              />

            </div>

          </div>

          {/* =================================================
              APPLY
          ================================================= */}

          <button
            type="button"
            className="apply-filter-button"
            onClick={handleApplyFilters}
          >
            Apply Filters
          </button>

        </aside>

        {/* ===================================================
            PRODUCT AREA
        =================================================== */}

        <section className="products-content">

          {/* =================================================
              RESULT HEADER
          ================================================= */}

          <div className="products-result-header">

            <div>

              <span className="products-result-count">
                {products.length}
              </span>

              <span className="products-result-label">
                {products.length === 1
                  ? " Product"
                  : " Products"}
              </span>

            </div>

            {search && (

              <span className="search-result-label">
                Search: "{search}"
              </span>

            )}

          </div>

          {/* =================================================
              NO PRODUCTS
          ================================================= */}

          {products.length === 0 ? (

            <div className="no-products">

              <div className="no-products-icon">
                <svg
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <circle
                    cx="11"
                    cy="11"
                    r="6"
                  />
                  <path d="M16 16L21 21" />
                </svg>
              </div>

              <h2>
                No products found
              </h2>

              <p>
                Try changing your search or filters.
              </p>

              <button
                onClick={handleResetFilters}
              >
                Clear Filters
              </button>

            </div>

          ) : (

            /* =================================================
               PRODUCT GRID
            ================================================= */

            <div className="products-grid">

              {products.map((product) => (

                <Link
                  key={product.id}
                  to={`/products/${product.id}`}
                  className="product-card"
                >

                  {/* =========================================
                      IMAGE
                  ========================================= */}

                  <div className="product-image-container">

                    {product.main_image ? (

                      <img
                        src={getImageUrl(
                          product.main_image
                        )}
                        alt={product.name}
                        className="product-image"
                      />

                    ) : (

                      <div className="product-image-placeholder">
                        No Image
                      </div>

                    )}

                    {/* DISCOUNT */}

                    {product.discount_price &&
                      Number(product.discount_price) <
                        Number(product.price) && (

                      <span className="discount-badge">

                        {Math.round(
                          (
                            (
                              Number(product.price) -
                              Number(product.discount_price)
                            ) /
                            Number(product.price)
                          ) *
                          100
                        )}

                        % OFF

                      </span>

                    )}

                  </div>

                  {/* =========================================
                      PRODUCT INFORMATION
                  ========================================= */}

                  <div className="product-card-info">

                    <span className="product-brand">
                      {product.brand_name ||
                        "Zivora"}
                    </span>

                    <h3>
                      {product.name}
                    </h3>

                    <div className="product-price">

                      {product.discount_price &&
                      Number(product.discount_price) <
                        Number(product.price) ? (

                        <>

                          <strong>
                            ₹
                            {Number(
                              product.discount_price
                            ).toLocaleString(
                              "en-IN"
                            )}
                          </strong>

                          <del>
                            ₹
                            {Number(
                              product.price
                            ).toLocaleString(
                              "en-IN"
                            )}
                          </del>

                        </>

                      ) : (

                        <strong>
                          ₹
                          {Number(
                            product.price || 0
                          ).toLocaleString(
                            "en-IN"
                          )}
                        </strong>

                      )}

                    </div>

                  </div>

                </Link>

              ))}

            </div>

          )}

        </section>

      </div>

    </div>
  );
}

export default Products;