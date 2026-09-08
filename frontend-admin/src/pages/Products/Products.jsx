import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../../services/api";
import "./Products.css";

function Products() {
  const [products, setProducts] = useState([]);

  const [brands, setBrands] = useState([]);
  const [categories, setCategories] = useState([]);

  const [loading, setLoading] = useState(true);
  const [loadingFilters, setLoadingFilters] = useState(true);

  const [error, setError] = useState("");

  // ==========================================================
  // FILTER STATE
  // ==========================================================

  const [search, setSearch] = useState("");
  const [brand, setBrand] = useState("");
  const [category, setCategory] = useState("");
  const [gender, setGender] = useState("");
  const [status, setStatus] = useState("");
  const [featured, setFeatured] = useState("");
  const [newArrival, setNewArrival] = useState("");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");

  // ==========================================================
  // PAGINATION
  // ==========================================================

  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;
  const [totalProducts, setTotalProducts] = useState(0);

  // ==========================================================
  // FETCH PRODUCTS
  // ==========================================================

  const fetchProducts = async (page = 1, filterValues = null) => {
    try {
      setLoading(true);
      setError("");

      const activeFilters = filterValues || {
        search,
        brand,
        category,
        gender,
        status,
        featured,
        newArrival,
        minPrice,
        maxPrice,
      };

      const params = new URLSearchParams();

      params.append("page", page);
      params.append("page_size", pageSize);

      // SEARCH
      if (activeFilters.search?.trim()) {
        params.append(
          "search",
          activeFilters.search.trim()
        );
      }

      // BRAND
      if (activeFilters.brand) {
        params.append(
          "brand",
          activeFilters.brand
        );
      }

      // CATEGORY
      if (activeFilters.category) {
        params.append(
          "category",
          activeFilters.category
        );
      }

      // GENDER
      if (activeFilters.gender) {
        params.append(
          "gender",
          activeFilters.gender
        );
      }

      // STATUS
      if (activeFilters.status) {
        params.append(
          "status",
          activeFilters.status
        );
      }

      // FEATURED
      if (activeFilters.featured) {
        params.append(
          "featured",
          activeFilters.featured
        );
      }

      // NEW ARRIVAL
      if (activeFilters.newArrival) {
        params.append(
          "new_arrival",
          activeFilters.newArrival
        );
      }

      // MIN PRICE
      if (activeFilters.minPrice) {
        params.append(
          "min_price",
          activeFilters.minPrice
        );
      }

      // MAX PRICE
      if (activeFilters.maxPrice) {
        params.append(
          "max_price",
          activeFilters.maxPrice
        );
      }

      const response = await api.get(
        `/products/products/?${params.toString()}`
      );

      const data = response.data;

      if (Array.isArray(data)) {
        setProducts(data);
        setTotalProducts(data.length);
      } else if (Array.isArray(data.results)) {
        setProducts(data.results);
        setTotalProducts(
          Number(data.count || data.results.length)
        );
      } else {
        setProducts([]);
        setTotalProducts(0);
      }
    } catch (err) {
      console.error(
        "Products fetch error:",
        err
      );

      if (err.response?.status === 401) {
        setError(
          "Authentication failed. Please login again."
        );
      } else if (err.response?.status === 403) {
        setError(
          "You do not have permission to view products."
        );
      } else {
        setError(
          err.response?.data?.detail ||
            "Unable to load products. Please try again."
        );
      }
    } finally {
      setLoading(false);
    }
  };

  // ==========================================================
  // FETCH BRANDS + CATEGORIES
  // ==========================================================

  const fetchFilterOptions = async () => {
    try {
      setLoadingFilters(true);

      const [
        brandsResponse,
        categoriesResponse,
      ] = await Promise.all([
        api.get("/products/brands/"),
        api.get("/products/categories/"),
      ]);

      const brandsData =
        brandsResponse.data;

      const categoriesData =
        categoriesResponse.data;

      setBrands(
        Array.isArray(brandsData)
          ? brandsData
          : Array.isArray(brandsData.results)
          ? brandsData.results
          : []
      );

      setCategories(
        Array.isArray(categoriesData)
          ? categoriesData
          : Array.isArray(categoriesData.results)
          ? categoriesData.results
          : []
      );
    } catch (err) {
      console.error(
        "Filter options fetch error:",
        err
      );
    } finally {
      setLoadingFilters(false);
    }
  };

  // ==========================================================
  // INITIAL LOAD
  // ==========================================================

  useEffect(() => {
    fetchFilterOptions();
    fetchProducts(1);
  }, []);

  // ==========================================================
  // SEARCH
  // ==========================================================

  const handleSearchSubmit = (e) => {
    e.preventDefault();

    setCurrentPage(1);
    fetchProducts(1);
  };

  // ==========================================================
  // APPLY FILTERS
  // ==========================================================

  const applyFilters = () => {
    setCurrentPage(1);
    fetchProducts(1);
  };

  // ==========================================================
  // RESET FILTERS
  // ==========================================================

  const resetFilters = () => {
    const emptyFilters = {
      search: "",
      brand: "",
      category: "",
      gender: "",
      status: "",
      featured: "",
      newArrival: "",
      minPrice: "",
      maxPrice: "",
    };

    setSearch("");
    setBrand("");
    setCategory("");
    setGender("");
    setStatus("");
    setFeatured("");
    setNewArrival("");
    setMinPrice("");
    setMaxPrice("");

    setCurrentPage(1);

    fetchProducts(1, emptyFilters);
  };

  // ==========================================================
  // PAGINATION
  // ==========================================================

  const totalPages = Math.ceil(
    totalProducts / pageSize
  );

  const goToPage = (page) => {
    if (
      page < 1 ||
      page > totalPages ||
      loading
    ) {
      return;
    }

    setCurrentPage(page);
    fetchProducts(page);
  };

  // ==========================================================
  // PAGE NUMBERS
  // ==========================================================

  const getPageNumbers = () => {
    if (totalPages <= 5) {
      return Array.from(
        { length: totalPages },
        (_, index) => index + 1
      );
    }

    if (currentPage <= 3) {
      return [1, 2, 3, 4, 5];
    }

    if (
      currentPage >=
      totalPages - 2
    ) {
      return [
        totalPages - 4,
        totalPages - 3,
        totalPages - 2,
        totalPages - 1,
        totalPages,
      ];
    }

    return [
      currentPage - 2,
      currentPage - 1,
      currentPage,
      currentPage + 1,
      currentPage + 2,
    ];
  };

  // ==========================================================
  // FORMAT PRICE
  // ==========================================================

  const formatPrice = (price) => {
    return `₹${Number(
      price || 0
    ).toLocaleString("en-IN")}`;
  };

  // ==========================================================
  // PRODUCT IMAGE URL
  // ==========================================================

  const getImageUrl = (image) => {
    if (!image) {
      return null;
    }

    if (
      image.startsWith("http://") ||
      image.startsWith("https://")
    ) {
      return image;
    }

    return `http://127.0.0.1:8000${image}`;
  };

  // ==========================================================
  // STATISTICS
  // ==========================================================

  const activeProducts =
    products.filter(
      (product) => product.is_active
    ).length;

  const inactiveProducts =
    products.filter(
      (product) => !product.is_active
    ).length;

  const featuredProducts =
    products.filter(
      (product) => product.is_featured
    ).length;

  const newArrivalProducts =
    products.filter(
      (product) => product.is_new_arrival
    ).length;

  // ==========================================================
  // LOADING
  // ==========================================================

  if (
    loading &&
    products.length === 0
  ) {
    return (
      <div className="products-page">
        <div className="products-loading">
          <div className="products-spinner"></div>

          <p>
            Loading products...
          </p>
        </div>
      </div>
    );
  }

  // ==========================================================
  // PAGE
  // ==========================================================

  return (
    <div className="products-page">

      {/* ======================================================
          HEADER
      ====================================================== */}

      <div className="products-header">

        <div>
          <p className="products-eyebrow">
            CATALOG
          </p>

          <h1>
            Products
          </h1>

          <p className="products-subtitle">
            Manage your Zivora product catalog
          </p>
        </div>

        <div className="products-header-actions">

          <button
            type="button"
            className="refresh-btn"
            onClick={() =>
              fetchProducts(
                currentPage
              )
            }
            disabled={loading}
          >
            ↻ Refresh
          </button>

          <Link
            to="/products/add"
            className="add-product-btn"
          >
            + Add Product
          </Link>

        </div>

      </div>

      {/* ======================================================
          ERROR
      ====================================================== */}

      {error && (
        <div className="products-error">

          <span>
            {error}
          </span>

          <button
            type="button"
            onClick={() =>
              fetchProducts(
                currentPage
              )
            }
          >
            Retry
          </button>

        </div>
      )}

      {/* ======================================================
          STATISTICS
      ====================================================== */}

      <div className="products-stats">

        <div className="stat-card">

          <span className="stat-label">
            Total Products
          </span>

          <strong>
            {totalProducts}
          </strong>

        </div>

        <div className="stat-card">

          <span className="stat-label">
            Active
          </span>

          <strong>
            {activeProducts}
          </strong>

        </div>

        <div className="stat-card">

          <span className="stat-label">
            Inactive
          </span>

          <strong>
            {inactiveProducts}
          </strong>

        </div>

        <div className="stat-card">

          <span className="stat-label">
            Featured
          </span>

          <strong>
            {featuredProducts}
          </strong>

        </div>

        <div className="stat-card">

          <span className="stat-label">
            New Arrivals
          </span>

          <strong>
            {newArrivalProducts}
          </strong>

        </div>

      </div>

      {/* ======================================================
          PRODUCTS CARD
      ====================================================== */}

      <div className="products-card">

        {/* ====================================================
            CARD HEADER
        ==================================================== */}

        <div className="products-card-header">

          <div>

            <h2>
              All Products
            </h2>

            <p>
              {totalProducts} product(s) found
            </p>

          </div>

        </div>

        {/* ====================================================
            FILTERS
        ==================================================== */}

        <div className="products-filters">

          {/* SEARCH */}

          <form
            className="product-search"
            onSubmit={
              handleSearchSubmit
            }
          >

            <span className="search-icon">
              🔍
            </span>

            <input
              type="text"
              value={search}
              onChange={(e) =>
                setSearch(
                  e.target.value
                )
              }
              placeholder="Search products..."
            />

            <button type="submit">
              Search
            </button>

          </form>

          {/* FILTER GRID */}

          <div className="filter-grid">

            {/* BRAND */}

            <div className="filter-field">

              <label>
                Brand
              </label>

              <select
                value={brand}
                onChange={(e) =>
                  setBrand(
                    e.target.value
                  )
                }
                disabled={
                  loadingFilters
                }
              >

                <option value="">
                  All Brands
                </option>

                {brands.map(
                  (item) => (
                    <option
                      key={item.id}
                      value={item.id}
                    >
                      {item.name}
                    </option>
                  )
                )}

              </select>

            </div>

            {/* CATEGORY */}

            <div className="filter-field">

              <label>
                Category
              </label>

              <select
                value={category}
                onChange={(e) =>
                  setCategory(
                    e.target.value
                  )
                }
                disabled={
                  loadingFilters
                }
              >

                <option value="">
                  All Categories
                </option>

                {categories.map(
                  (item) => (
                    <option
                      key={item.id}
                      value={item.id}
                    >
                      {item.name}
                    </option>
                  )
                )}

              </select>

            </div>

            {/* GENDER */}

            <div className="filter-field">

              <label>
                Gender
              </label>

              <select
                value={gender}
                onChange={(e) =>
                  setGender(
                    e.target.value
                  )
                }
              >

                <option value="">
                  All Gender
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

            {/* STATUS */}

            <div className="filter-field">

              <label>
                Status
              </label>

              <select
                value={status}
                onChange={(e) =>
                  setStatus(
                    e.target.value
                  )
                }
              >

                <option value="">
                  All Status
                </option>

                <option value="active">
                  Active
                </option>

                <option value="inactive">
                  Inactive
                </option>

              </select>

            </div>

            {/* FEATURED */}

            <div className="filter-field">

              <label>
                Featured
              </label>

              <select
                value={featured}
                onChange={(e) =>
                  setFeatured(
                    e.target.value
                  )
                }
              >

                <option value="">
                  All Products
                </option>

                <option value="true">
                  Featured
                </option>

                <option value="false">
                  Not Featured
                </option>

              </select>

            </div>

            {/* NEW ARRIVAL */}

            <div className="filter-field">

              <label>
                New Arrival
              </label>

              <select
                value={newArrival}
                onChange={(e) =>
                  setNewArrival(
                    e.target.value
                  )
                }
              >

                <option value="">
                  All Products
                </option>

                <option value="true">
                  New Arrivals
                </option>

                <option value="false">
                  Not New
                </option>

              </select>

            </div>

            {/* MIN PRICE */}

            <div className="filter-field">

              <label>
                Min Price
              </label>

              <input
                type="number"
                min="0"
                value={minPrice}
                onChange={(e) =>
                  setMinPrice(
                    e.target.value
                  )
                }
                placeholder="₹0"
              />

            </div>

            {/* MAX PRICE */}

            <div className="filter-field">

              <label>
                Max Price
              </label>

              <input
                type="number"
                min="0"
                value={maxPrice}
                onChange={(e) =>
                  setMaxPrice(
                    e.target.value
                  )
                }
                placeholder="₹10,000"
              />

            </div>

          </div>

          {/* FILTER ACTIONS */}

          <div className="filter-actions">

            <button
              type="button"
              className="apply-filter-btn"
              onClick={
                applyFilters
              }
            >
              Apply Filters
            </button>

            <button
              type="button"
              className="reset-filter-btn"
              onClick={
                resetFilters
              }
            >
              Reset
            </button>

          </div>

        </div>

        {/* ====================================================
            EMPTY
        ==================================================== */}

        {products.length === 0 ? (

          <div className="empty-products">

            <div className="empty-icon">
              📦
            </div>

            <h3>
              No products found
            </h3>

            <p>
              Try changing your search
              or filters.
            </p>

            <div className="empty-actions">

              <button
                type="button"
                className="reset-filter-btn"
                onClick={
                  resetFilters
                }
              >
                Reset Filters
              </button>

              <Link
                to="/products/add"
                className="add-product-btn"
              >
                + Add Product
              </Link>

            </div>

          </div>

        ) : (

          /* ==================================================
             TABLE
          ================================================== */

          <div className="products-table-wrapper">

            <table className="products-table">

              <thead>

                <tr>

                  <th>
                    Product
                  </th>

                  <th>
                    Brand
                  </th>

                  <th>
                    Category
                  </th>

                  <th>
                    Gender
                  </th>

                  <th>
                    Price
                  </th>

                  <th>
                    Stock
                  </th>

                  <th>
                    Featured
                  </th>

                  <th>
                    New
                  </th>

                  <th>
                    Status
                  </th>

                  <th>
                    Action
                  </th>

                </tr>

              </thead>

              <tbody>

                {products.map(
                  (product) => {

                    const imageUrl =
                      getImageUrl(
                        product.main_image
                      );

                    const totalStock =
                      Number(
                        product.total_stock ||
                          0
                      );

                    return (
                      <tr
                        key={
                          product.id
                        }
                      >

                        {/* PRODUCT */}

                        <td>

                          <div className="product-info">

                            <div className="product-image">

                              {imageUrl ? (

                                <img
                                  src={
                                    imageUrl
                                  }
                                  alt={
                                    product.name
                                  }
                                />

                              ) : (

                                <span>
                                  📦
                                </span>

                              )}

                            </div>

                            <div className="product-name-wrapper">

                              <strong>
                                {
                                  product.name
                                }
                              </strong>

                              <span>
                                ID: #
                                {
                                  product.id
                                }
                              </span>

                            </div>

                          </div>

                        </td>

                        {/* BRAND */}

                        <td>

                          <span className="table-text">
                            {
                              product.brand_name ||
                              "-"
                            }
                          </span>

                        </td>

                        {/* CATEGORY */}

                        <td>

                          <span className="table-text">
                            {
                              product.category_name ||
                              "-"
                            }
                          </span>

                        </td>

                        {/* GENDER */}

                        <td>

                          <span className="gender-badge">
                            {
                              product.gender ||
                              "-"
                            }
                          </span>

                        </td>

                        {/* PRICE */}

                        <td>

                          <div className="price-wrapper">

                            {product.discount_price &&
                            Number(
                              product.discount_price
                            ) <
                              Number(
                                product.price
                              ) ? (

                              <>

                                <strong>
                                  {formatPrice(
                                    product.discount_price
                                  )}
                                </strong>

                                <span className="old-price">
                                  {formatPrice(
                                    product.price
                                  )}
                                </span>

                              </>

                            ) : (

                              <strong>
                                {formatPrice(
                                  product.price
                                )}
                              </strong>

                            )}

                          </div>

                        </td>

                        {/* STOCK */}

                        <td>

                          <span
                            className={
                              totalStock >
                              0
                                ? "stock-badge stock-available"
                                : "stock-badge stock-empty"
                            }
                          >
                            {
                              totalStock
                            }
                          </span>

                        </td>

                        {/* FEATURED */}

                        <td>

                          {product.is_featured ? (

                            <span className="feature-badge feature-yes">
                              Featured
                            </span>

                          ) : (

                            <span className="feature-badge feature-no">
                              —
                            </span>

                          )}

                        </td>

                        {/* NEW ARRIVAL */}

                        <td>

                          {product.is_new_arrival ? (

                            <span className="new-badge">
                              New
                            </span>

                          ) : (

                            <span className="feature-badge feature-no">
                              —
                            </span>

                          )}

                        </td>

                        {/* STATUS */}

                        <td>

                          {product.is_active ? (

                            <span className="status-badge status-active">
                              Active
                            </span>

                          ) : (

                            <span className="status-badge status-inactive">
                              Inactive
                            </span>

                          )}

                        </td>

                        {/* ACTION */}

                        <td>

                          <Link
                            to={`/products/${product.id}`}
                            className="view-btn"
                          >
                            View
                          </Link>

                        </td>

                      </tr>
                    );
                  }
                )}

              </tbody>

            </table>

          </div>

        )}

        {/* ====================================================
            PAGINATION
        ==================================================== */}

        {totalPages > 1 &&
          products.length > 0 && (

          <div className="products-pagination">

            <div className="pagination-info">
              Page{" "}
              {currentPage}{" "}
              of{" "}
              {totalPages}
            </div>

            <div className="pagination-controls">

              <button
                type="button"
                disabled={
                  currentPage ===
                    1 ||
                  loading
                }
                onClick={() =>
                  goToPage(
                    currentPage -
                      1
                  )
                }
              >
                ←
              </button>

              {getPageNumbers().map(
                (page) => (

                  <button
                    type="button"
                    key={page}
                    className={
                      currentPage ===
                      page
                        ? "active"
                        : ""
                    }
                    onClick={() =>
                      goToPage(
                        page
                      )
                    }
                    disabled={
                      loading
                    }
                  >
                    {page}
                  </button>

                )
              )}

              <button
                type="button"
                disabled={
                  currentPage ===
                    totalPages ||
                  loading
                }
                onClick={() =>
                  goToPage(
                    currentPage +
                      1
                  )
                }
              >
                →
              </button>

            </div>

          </div>

        )}

      </div>

    </div>
  );
}

export default Products;