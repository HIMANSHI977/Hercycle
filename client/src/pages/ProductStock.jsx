import { useEffect, useState } from "react";
import { AlertTriangle, PackagePlus, RefreshCw, ShoppingBag, Trash2 } from "lucide-react";

import API from "../services/api.js";
import "../styles/ProductStock.css";

const initialForm = {
  name: "",
  category: "sanitary_pad",
  quantity: "",
  minimumQuantity: "5",
  lastPurchasedAt: "",
  notes: ""
};

const categoryLabels = {
  sanitary_pad: "Sanitary pads",
  tampon: "Tampons",
  menstrual_cup: "Menstrual cup",
  panty_liner: "Panty liners",
  other: "Other"
};

const formatDate = (date) => {
  if (!date) return "Not recorded";

  const parsed = new Date(date);

  if (Number.isNaN(parsed.getTime())) return "Not recorded";

  return parsed.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric"
  });
};

const ProductStock = () => {
  const [products, setProducts] = useState([]);
  const [lowStockCount, setLowStockCount] = useState(0);
  const [form, setForm] = useState(initialForm);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await API.get("/products");

      setProducts(response.data.products || []);
      setLowStockCount(response.data.lowStockCount || 0);
    } catch (err) {
      setError(err.response?.data?.message || "Unable to load product stock.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value
    }));
  };

  const resetForm = () => {
    setForm(initialForm);
    setEditingId(null);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!form.name.trim()) {
      setError("Enter a product name.");
      return;
    }

    const payload = {
      name: form.name.trim(),
      category: form.category,
      quantity: Number(form.quantity),
      minimumQuantity: Number(form.minimumQuantity),
      lastPurchasedAt: form.lastPurchasedAt || null,
      notes: form.notes.trim()
    };

    try {
      setSaving(true);
      setError("");
      setSuccess("");

      if (editingId) {
        await API.put(`/products/${editingId}`, payload);
        setSuccess("Product stock updated.");
      } else {
        await API.post("/products", payload);
        setSuccess("Product stock added.");
      }

      resetForm();
      await fetchProducts();
    } catch (err) {
      setError(err.response?.data?.message || "Unable to save product stock.");
    } finally {
      setSaving(false);
    }
  };

  const editProduct = (product) => {
    setEditingId(product._id);
    setForm({
      name: product.name,
      category: product.category,
      quantity: String(product.quantity),
      minimumQuantity: String(product.minimumQuantity),
      lastPurchasedAt: product.lastPurchasedAt
        ? new Date(product.lastPurchasedAt).toISOString().slice(0, 10)
        : "",
      notes: product.notes || ""
    });
  };

  const deleteProduct = async (productId) => {
    if (!window.confirm("Remove this product from your stock?")) return;

    try {
      setSaving(true);
      setError("");

      await API.delete(`/products/${productId}`);
      setSuccess("Product stock removed.");

      if (editingId === productId) resetForm();

      await fetchProducts();
    } catch (err) {
      setError(err.response?.data?.message || "Unable to remove product stock.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <main className="product-stock-page">
      <header className="product-stock-header">
        <div>
          <span className="product-stock-eyebrow">
            <ShoppingBag size={14} /> PERSONAL INVENTORY
          </span>
          <h1>Menstrual Product Stock</h1>
          <p>Keep track of your pads, liners, tampons or menstrual cups privately.</p>
        </div>

        <button type="button" onClick={fetchProducts} disabled={loading}>
          <RefreshCw size={16} /> Refresh
        </button>
      </header>

      {error && <div className="product-stock-message error" role="alert">{error}</div>}
      {success && <div className="product-stock-message success" role="status">{success}</div>}

      <section className="product-stock-summary">
        <div>
          <PackagePlus size={22} />
          <span>TRACKED PRODUCTS</span>
          <strong>{products.length}</strong>
        </div>
        <div className={lowStockCount > 0 ? "low-stock" : ""}>
          <AlertTriangle size={22} />
          <span>LOW STOCK ITEMS</span>
          <strong>{lowStockCount}</strong>
        </div>
      </section>

      <section className="product-stock-layout">
        <form className="product-stock-form" onSubmit={handleSubmit}>
          <h2>{editingId ? "Update product" : "Add product"}</h2>

          <label htmlFor="productName">Product name</label>
          <input
            id="productName"
            name="name"
            value={form.name}
            maxLength="100"
            onChange={handleChange}
            placeholder="Example: Regular sanitary pads"
          />

          <label htmlFor="productCategory">Category</label>
          <select id="productCategory" name="category" value={form.category} onChange={handleChange}>
            {Object.entries(categoryLabels).map(([value, label]) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </select>

          <div className="product-stock-form-grid">
            <div>
              <label htmlFor="productQuantity">Available quantity</label>
              <input
                id="productQuantity"
                name="quantity"
                type="number"
                min="0"
                max="100000"
                value={form.quantity}
                onChange={handleChange}
              />
            </div>

            <div>
              <label htmlFor="minimumQuantity">Low-stock alert at</label>
              <input
                id="minimumQuantity"
                name="minimumQuantity"
                type="number"
                min="0"
                max="100000"
                value={form.minimumQuantity}
                onChange={handleChange}
              />
            </div>
          </div>

          <label htmlFor="lastPurchasedAt">Last purchase date</label>
          <input
            id="lastPurchasedAt"
            name="lastPurchasedAt"
            type="date"
            value={form.lastPurchasedAt}
            onChange={handleChange}
          />

          <label htmlFor="productNotes">Notes</label>
          <textarea
            id="productNotes"
            name="notes"
            rows="3"
            maxLength="300"
            value={form.notes}
            onChange={handleChange}
          />

          <div className="product-stock-form-actions">
            {editingId && (
              <button type="button" className="product-stock-cancel" onClick={resetForm}>Cancel</button>
            )}
            <button type="submit" disabled={saving}>
              {saving ? "Saving..." : editingId ? "Update product" : "Add product"}
            </button>
          </div>
        </form>

        <section className="product-stock-list">
          <div className="product-stock-list-heading">
            <h2>Your inventory</h2>
            <span>{products.length} items</span>
          </div>

          {loading ? (
            <div className="product-stock-loading">Loading product stock...</div>
          ) : products.length === 0 ? (
            <div className="product-stock-empty">
              <ShoppingBag size={28} />
              <h3>No products added yet</h3>
              <p>Add your menstrual products to monitor availability.</p>
            </div>
          ) : (
            <div className="product-stock-cards">
              {products.map((product) => {
                const isLow = product.quantity <= product.minimumQuantity;

                return (
                  <article className={`product-stock-card ${isLow ? "low" : ""}`} key={product._id}>
                    <div>
                      <span>{categoryLabels[product.category] || "Other"}</span>
                      <h3>{product.name}</h3>
                      <p>{product.quantity} available · Alert at {product.minimumQuantity}</p>
                      <small>Last purchased: {formatDate(product.lastPurchasedAt)}</small>
                      {product.notes && <small>{product.notes}</small>}
                    </div>

                    {isLow && (
                      <div className="product-low-badge">
                        <AlertTriangle size={14} /> Low stock
                      </div>
                    )}

                    <div className="product-stock-actions">
                      <button type="button" onClick={() => editProduct(product)}>Edit</button>
                      <button
                        type="button"
                        onClick={() => deleteProduct(product._id)}
                        disabled={saving}
                        aria-label={`Remove ${product.name}`}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </section>
      </section>
    </main>
  );
};

export default ProductStock;
