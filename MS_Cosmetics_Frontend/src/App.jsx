import React, { useEffect, useMemo, useState } from "react";
import "./App.css";

const defaultProducts = [
 {id:1,name:"MS Glow Vitamin C Serum",category:"Skin Care",price:599,old:799,image:"/images/serum.jpg"},
 {id:2,name:"MS Dew Drop Moisturizer",category:"Skin Care",price:449,old:599,image:"/images/moisturizer.jpg"},
 {id:3,name:"MS Sun Shield SPF 50",category:"Skin Care",price:499,old:649,image:"/images/sunscreen.jpg"},
 {id:4,name:"MS Velvet Matte Lipstick",category:"Makeup",price:349,old:449,image:"/images/lipstick.jpg"},
 {id:5,name:"MS Flawless Finish Foundation",category:"Makeup",price:699,old:899,image:"/images/foundation.jpg"},
 {id:6,name:"MS Rose Blush",category:"Makeup",price:399,old:499,image:"/images/blush.jpg"},
 {id:7,name:"MS Nourish Hair Oil",category:"Hair Care",price:299,old:399,image:"/images/hairoil.jpg"},
 {id:8,name:"MS Smooth Hair Mask",category:"Hair Care",price:399,old:499,image:"/images/hairmask.jpg"}
];
const API = "/api";
async function apiRequest(path, options = {}) {
 const token = localStorage.getItem("msToken");
 const response = await fetch(`${API}${path}`, {
  headers: {"Content-Type":"application/json", ...(token ? {Authorization:`Bearer ${token}`} : {}), ...(options.headers||{})},
  ...options
 });
 const data = await response.json().catch(()=>({message:"Unexpected server response"}));
 if (!response.ok) throw new Error(data.message || "Request failed");
 return data;
}
const money = n => `₹${n}`;
const initialCart = () => { try { return JSON.parse(localStorage.getItem("msCart") || "[]"); } catch { return []; } };

function ProductCard({product,onAdd}) {
 return <article className="product-card"><img src={product.image} alt={product.name}/><div className="product-info">
  <small>{product.category}</small><h3>{product.name}</h3><div className="price">{money(product.price)} <span className="old-price">{money(product.old)}</span></div>
  <button className="add-btn" onClick={()=>onAdd(product)}>ADD TO BAG <span>＋</span></button>
 </div></article>;
}
function Heading({eyebrow,title,children}) { return <div className="section-heading"><span className="eyebrow">{eyebrow}</span><h1>{title}</h1>{children && <p>{children}</p>}</div>; }

export default function App() {
 const [page,setPage] = useState("home");
 const [products,setProducts] = useState(defaultProducts);
 const [menuOpen,setMenuOpen] = useState(false);
 const [filter,setFilter] = useState("All");
 const [cart,setCart] = useState(initialCart);
 const [faqOpen,setFaqOpen] = useState(0);
 const [user,setUser] = useState(()=>{try{return JSON.parse(localStorage.getItem("msUser")||"null")}catch{return null}});
 const [notice,setNotice] = useState("");
 const [loggedIn,setLoggedIn] = useState(()=>Boolean(localStorage.getItem("msToken")));
 const [checkoutTotal,setCheckoutTotal] = useState(0);
 const subtotal = cart.reduce((s,p)=>s+p.price*p.qty,0);
 const shipping = subtotal===0 || subtotal>=999 ? 0 : 60;
 const total = subtotal+shipping;
 const filtered = useMemo(()=>filter==="All"?products:products.filter(p=>p.category===filter),[filter]);

 useEffect(()=>{localStorage.setItem("msCart",JSON.stringify(cart));},[cart]);
 useEffect(()=>{apiRequest("/products").then(data=>setProducts(data.products || defaultProducts)).catch(()=>setProducts(defaultProducts));},[]);
 useEffect(()=>{window.scrollTo({top:0,behavior:"smooth"});setMenuOpen(false);},[page]);
 const go = id => {setNotice("");setPage(id);};
 const addToCart = p => {setCart(old=>{const found=old.find(x=>x.id===p.id);return found?old.map(x=>x.id===p.id?{...x,qty:x.qty+1}:x):[...old,{...p,qty:1}]});setNotice(`${p.name} added to your bag.`);};
 const changeQty = (id,delta)=>setCart(old=>old.map(p=>p.id===id?{...p,qty:p.qty+delta}:p).filter(p=>p.qty>0));
 const remove = id=>setCart(old=>old.filter(p=>p.id!==id));
 const handleForm = (e,msg)=>{e.preventDefault();e.currentTarget.reset();setNotice(msg);};
 const register = async e=>{e.preventDefault();const f=e.currentTarget;const data=new FormData(f);if(data.get("password")!==data.get("confirm")){setNotice("Passwords do not match.");return;}try{const result=await apiRequest("/auth/register",{method:"POST",body:JSON.stringify({name:data.get("name"),email:data.get("email"),password:data.get("password")})});localStorage.setItem("msToken",result.token);localStorage.setItem("msUser",JSON.stringify(result.user));setUser(result.user);setLoggedIn(true);f.reset();setNotice("Account created successfully.");go("home");}catch(err){setNotice(err.message);}};
 const login = async e=>{e.preventDefault();const d=new FormData(e.currentTarget);try{const result=await apiRequest("/auth/login",{method:"POST",body:JSON.stringify({email:d.get("email"),password:d.get("password")})});localStorage.setItem("msToken",result.token);localStorage.setItem("msUser",JSON.stringify(result.user));setUser(result.user);setLoggedIn(true);setNotice(`Welcome back, ${result.user.name}!`);go("home");}catch(err){setNotice(err.message);}};
 const logout=()=>{localStorage.removeItem("msToken");localStorage.removeItem("msUser");setUser(null);setLoggedIn(false);setNotice("You have been logged out.");go("home");};
 const placeOrder=async e=>{e.preventDefault();if(!cart.length){setNotice("Your bag is empty.");go("products");return;}const f=e.currentTarget;const d=new FormData(f);try{const result=await apiRequest("/orders",{method:"POST",body:JSON.stringify({customer:{name:d.get("name"),email:d.get("email"),phone:d.get("phone"),address:d.get("address"),city:d.get("city"),pincode:d.get("pincode")},items:cart.map(({id,qty})=>({productId:id,quantity:qty}))})});setCart([]);setNotice(`Thank you for shopping with MS Cosmetics! Your order ID: ${result.order.orderNumber}`);go("home");}catch(err){setNotice(err.message);}};
 const nav=[["Home","home"],["Products","products"],["About Us","about"],["Contact Us","contact"]];
 const productList=(list)=> <div className="product-grid">{list.map(p=><ProductCard key={p.id} product={p} onAdd={addToCart}/>)}</div>;

 return <>
  <div className="topbar">A LITTLE SELF-CARE, A LOT OF CONFIDENCE · FREE SHIPPING ON ORDERS ABOVE ₹999</div>
  <header><button className="logo logo-button" onClick={()=>go("home")}>MS COSMETICS<small>BEAUTY WITH CONFIDENCE</small></button>
   <nav className={menuOpen?"show":""}>{nav.map(([label,id])=><button key={id} className={`nav-link ${page===id?"active":""}`} onClick={()=>go(id)}>{label}</button>)}</nav>
   <div className="header-right"><button onClick={()=>loggedIn?logout():go("login")}>{loggedIn?"Logout":"Login"}</button><button className="cart-icon" onClick={()=>go("cart")}>♧ <span className="cart-count">{cart.reduce((s,p)=>s+p.qty,0)}</span></button><button className="menu-btn" onClick={()=>setMenuOpen(!menuOpen)}>☰</button></div>
  </header>
  {notice && <div className="notice" role="status">{notice}<button onClick={()=>setNotice("")}>×</button></div>}

  <main>
  {page==="home" && <><section className="hero"><div className="hero-content"><span className="eyebrow">YOUR DAILY DOSE OF BEAUTY</span><h1>Glow in your<br/><em>own way.</em></h1><p>Discover feel-good beauty essentials, thoughtfully brought together for your everyday rituals.</p><button className="btn" onClick={()=>go("products")}>SHOP THE COLLECTION →</button><p className="hero-note">Made for you. Made with care.</p></div><div className="hero-image"/></section>
   <div className="features"><div className="feature"><span>❀</span><h3>Everyday essentials</h3><p>Beauty for your routine</p></div><div className="feature"><span>♧</span><h3>Careful delivery</h3><p>To your doorstep</p></div><div className="feature"><span>♡</span><h3>Made with love</h3><p>Feel-good beauty</p></div></div>
   <Heading eyebrow="THE MS COLLECTION" title="Find your feel-good." children="Explore our favourite beauty essentials."/><div className="home-products">{productList(products.slice(0,4))}<center><button className="btn" onClick={()=>go("products")}>EXPLORE ALL PRODUCTS</button></center></div></>}

  {page==="products" && <><Heading eyebrow="THE MS COLLECTION" title="Find your feel-good." children="Explore beauty essentials created for your everyday routine."/><div className="filters">{["All","Skin Care","Makeup","Hair Care"].map(x=><button key={x} className={`filter-btn ${filter===x?"active":""}`} onClick={()=>setFilter(x)}>{x}</button>)}</div>{productList(filtered)}</>}

  {page==="about" && <><div className="about-intro"><span className="eyebrow">A NOTE FROM US</span><h1>Beauty is yours to define.</h1><p>MS Cosmetics is built around one simple belief: confidence is the most beautiful thing you can wear.</p></div><div className="about-layout"><img src="/images/moisturizer.jpg" alt="MS Cosmetics skincare products"/><div><span className="eyebrow">OUR STORY</span><h2>A little care.<br/><em style={{color:"#c28c8e"}}>A lot of confidence.</em></h2><p>We created MS Cosmetics to make everyday beauty feel joyful, simple and personal.</p><p>From skincare staples to makeup favourites, every product is selected to become part of your own routine.</p><p>Our promise is to keep exploring thoughtful essentials, welcoming self-expression and celebrating beauty in all its everyday forms.</p><button className="btn" onClick={()=>go("products")}>DISCOVER THE COLLECTION</button></div></div></>}

  {page==="contact" && <><Heading eyebrow="WE'RE HERE FOR YOU" title="Let's talk beauty." children="Questions, feedback or just want to say hello? Send our team a message."/><form className="contact-form" onSubmit={async e=>{e.preventDefault();const f=e.currentTarget;const d=new FormData(f);try{await apiRequest("/contact",{method:"POST",body:JSON.stringify({name:d.get("name"),email:d.get("email"),subject:d.get("subject"),message:d.get("message")})});f.reset();setNotice("Thank you! Your message has been sent to MS Cosmetics.");}catch(err){setNotice(err.message);}}}><div className="form-row"><input name="name" placeholder="Your name *" required/><input name="email" type="email" placeholder="Email address *" required/></div><input name="subject" placeholder="Subject *" required/><textarea name="message" placeholder="Your message *" required/><button className="btn">SEND MESSAGE</button></form></>}

  {page==="login" && <div className="auth-box"><div className="auth-logo">MS<small>COSMETICS</small></div><br/><span className="eyebrow">WELCOME TO MS COSMETICS</span><h1>Welcome back.</h1><p>Sign in to continue your beauty journey.</p><form onSubmit={login}><input name="email" type="email" placeholder="Email address *" required/><input name="password" type="password" placeholder="Password *" required/><button className="btn">LOGIN</button></form><div className="auth-links"><button onClick={()=>go("forgot")}>Forgot password?</button><button onClick={()=>go("signup")}>Create an account</button></div></div>}

  {page==="signup" && <div className="auth-box"><div className="auth-logo">MS<small>COSMETICS</small></div><br/><span className="eyebrow">WELCOME TO MS COSMETICS</span><h1>Create your account</h1><p>Join us for beauty notes, new launches and a smoother shopping experience.</p><form onSubmit={register}><input name="name" placeholder="Full name *" required/><input name="email" type="email" placeholder="Email address *" required/><input name="password" type="password" placeholder="Password *" minLength="6" required/><input name="confirm" type="password" placeholder="Confirm password *" required/><button className="btn">CREATE ACCOUNT</button></form><p>Already have an account? <button className="text-button" onClick={()=>go("login")}>Login</button></p></div>}

  {page==="forgot" && <div className="auth-box"><div className="auth-logo">MS<small>COSMETICS</small></div><br/><span className="eyebrow">ACCOUNT SUPPORT</span><h1>Reset your password</h1><p>Enter your email and we'll guide you through resetting your password.</p><form onSubmit={e=>{e.preventDefault();const d=new FormData(e.currentTarget);setNotice(user&&user.email===d.get("email")?"Demo account found. A real reset email requires a connected backend.":"No registered demo account found with this email.");}}><input name="email" type="email" placeholder="Email address *" required/><button className="btn">SEND RESET LINK</button></form><p>New here? <button className="text-button" onClick={()=>go("signup")}>Create an account</button></p></div>}

  {page==="faq" && <><Heading eyebrow="A FEW QUICK ANSWERS" title={<>Frequently asked<br/>questions.</>} children="Everything you need to know about shopping with MS Cosmetics."/><div className="faq-list">{[["How can I place an order?","Browse products, add your favourites to the cart and continue to checkout."],["How much is shipping?","Shipping is ₹60 for orders below ₹999. Shipping is free on orders above ₹999."],["Can I change or cancel an order?","Please contact our support team as soon as possible for assistance with order changes."],["Are the products branded as MS Cosmetics?","MS Cosmetics is the store brand used in this demonstration website."],["How do I reset my password?","Visit the login page and click Forgot password to access the password reset form."]].map(([q,a],i)=><div className={`faq-item ${faqOpen===i?"open":""}`} key={q}><button className="faq-question" onClick={()=>setFaqOpen(faqOpen===i?-1:i)}>{q}<span>{faqOpen===i?"−":"+"}</span></button>{faqOpen===i&&<div className="faq-answer">{a}</div>}</div>)}</div></>}

  {page==="cart" && <><Heading eyebrow="YOUR BAG" title="A little something for you." children="Review your MS Cosmetics favourites before checkout."/><div className="cart-layout"><div>{cart.length===0?<div className="empty-cart"><h2>Your bag is empty.</h2><p>Discover your beauty favourites.</p><button className="btn" onClick={()=>go("products")}>SHOP PRODUCTS</button></div>:cart.map(item=><div className="cart-item" key={item.id}><img src={item.image} alt={item.name}/><div><h3>{item.name}</h3><p>{item.category}</p><div className="price">{money(item.price)}</div><div className="quantity"><button onClick={()=>changeQty(item.id,-1)}>−</button>{item.qty}<button onClick={()=>changeQty(item.id,1)}>＋</button></div></div><button className="remove" onClick={()=>remove(item.id)}>×</button></div>)}</div><aside className="summary"><h3>ORDER SUMMARY</h3><div className="summary-row"><span>Subtotal</span><strong>{money(subtotal)}</strong></div><div className="summary-row"><span>Shipping</span><strong>{shipping===0?"FREE":money(shipping)}</strong></div><div className="summary-row total"><span>Total</span><strong>{money(total)}</strong></div><button className="btn" onClick={()=>cart.length?go("checkout"):setNotice("Your shopping bag is empty!")}>PROCEED TO CHECKOUT</button><p className="summary-note">Shipping is ₹60 below ₹999.</p></aside></div></>}

  {page==="checkout" && <><Heading eyebrow="ALMOST YOURS" title="Checkout." children="Add your delivery details to complete this demo order."/><form className="checkout-box" onSubmit={placeOrder}><input name="name" placeholder="Full name *" required/><input name="email" type="email" placeholder="Email address *" required/><input name="phone" type="tel" placeholder="Phone number *" pattern="[0-9]{10}" required/><textarea name="address" placeholder="Delivery address *" required/><div className="form-row"><input name="city" placeholder="City *" required/><input name="pincode" placeholder="PIN code *" pattern="[0-9]{6}" required/></div><div className="summary-row"><span>Order total</span><strong>{money(total)}</strong></div><button className="btn">PLACE DEMO ORDER</button><p className="summary-note">Demo checkout only — no real payment gateway is connected.</p></form></>}

  {(page==="terms"||page==="privacy") && <><Heading eyebrow="MS COSMETICS" title={page==="terms"?"Terms & Conditions":"Privacy Policy"}/><div className="policy-box">{page==="terms"?<><p>By using this demo website, you agree to use it lawfully. Product descriptions, prices and availability are illustrative and may be changed.</p><h3>1. Website Usage</h3><p>Users must use the website responsibly and provide accurate information when completing forms.</p><h3>2. Products and Pricing</h3><p>All displayed product information and prices are illustrative for this demonstration.</p><h3>3. Orders</h3><p>Orders placed through this prototype are not real purchases. No actual payment is processed.</p></>:<><p>MS Cosmetics values your privacy. This prototype does not send form details to a server.</p><h3>1. Information Collection</h3><p>Information entered into forms is used only for the front-end demonstration.</p><h3>2. Personal Information</h3><p>This demonstration does not connect to a live customer database.</p><h3>3. Cookies and Storage</h3><p>Browser local storage may be used to remember demonstration cart and account information.</p><h3>4. Security</h3><p>This prototype is not designed for storing sensitive personal information.</p></>}<h3>Contact</h3><p>For questions, please visit the <button className="text-button" onClick={()=>go("contact")}>Contact Us</button> page.</p></div></>}
  </main>
  <footer><div className="footer-grid"><div><h2>MS COSMETICS</h2><p>Beauty with confidence. Thoughtful beauty essentials for your everyday glow.</p><p className="social">◎　f　✉</p></div><div><h4>EXPLORE</h4><button onClick={()=>go("products")}>Shop all</button><button onClick={()=>go("about")}>Our story</button><button onClick={()=>go("contact")}>Contact</button></div><div><h4>HELP & SUPPORT</h4><button onClick={()=>go("faq")}>FAQs</button><button onClick={()=>go("contact")}>Shipping & returns</button><button onClick={()=>go("terms")}>Terms & conditions</button><button onClick={()=>go("privacy")}>Privacy policy</button></div><div><h4>STAY IN THE GLOW</h4><p>Get beauty notes and new-launch updates.</p><form className="newsletter" onSubmit={async e=>{e.preventDefault();const f=e.currentTarget;const d=new FormData(f);try{await apiRequest("/newsletter",{method:"POST",body:JSON.stringify({email:d.get("email")})});f.reset();setNotice("Thank you for joining MS Cosmetics!");}catch(err){setNotice(err.message);}}}><input name="email" type="email" placeholder="Your email address" required/><button>Join</button></form></div></div><div className="copyright">© 2026 MS COSMETICS. ALL RIGHTS RESERVED. BEAUTY WITH CONFIDENCE.</div></footer>
 </>;
}
