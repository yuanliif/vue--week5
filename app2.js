const apiUrl = 'https://vue3-course-api.hexschool.io/v2';
const apiPath = 'pastelsy';

// 將會使用的方法從veeValidate鐘用解構復職的方式取出，減少檔案大小
const { defineRule, Form, Field, ErrorMessage, configure } = VeeValidate;
const { required, email, min, max } = VeeValidateRules;
const { localize, loadLocaleFromURL } = VeeValidateI18n;

// 名稱是自行定義的('名稱', 取出的內容)
defineRule('required', required);
defineRule('email', email);
defineRule('min', min);
defineRule('max', max);

loadLocaleFromURL('https://unpkg.com/@vee-validate/i18n@4.1.0/dist/locale/zh_TW.json');

configure({
  generateMessage: localize('zh_TW'),
});

const app = Vue.createApp({
  data () {
    return {
      // 避免length的時候報錯
      cartData: {
        carts: []
      },
      products: [],
      productId: '',
      isLoadingItem: '',
      form: {
        user: {
          name: '',
          email: '',
          tel: '',
          address: '',
        },
        message: '',
      },
      isProcessing: false,
    };
  },
  mounted () {
    this.getProducts();
    this.getCart();
  },
  methods: {
    getProducts () {
      axios.get(`${apiUrl}/api/${apiPath}/products/all`).then((res) => {
        this.products = res.data.products;
      });
    },
    openProductModal(id) {
      this.$refs.productModal.openModal();
      this.productId = id;
    },
    getCart() {
      axios.get(`${apiUrl}/api/${apiPath}/cart`).then((res) => {
        this.cartData = res.data.data;
      });
    },
    addToCart(id, qty = 1) {
      const data = {
        product_id: id,
        qty,
      };
      this.isLoadingItem = id;
      axios.post(`${apiUrl}/api/${apiPath}/cart`, { data }).then((res) => {
        console.log(res);
        this.getCart();
        this.isLoadingItem = '';
        this.$refs.productModal.closeModal();
      });
    },
    deleteCartItem(id) {
      this.isLoadingItem = id;
      axios.delete(`${apiUrl}/api/${apiPath}/cart/${id}`).then((res) => {
        console.log(res);
        this.isLoadingItem = '';
        this.getCart();
      });
    },
    deleteAllCarts() {
      const url = `${apiUrl}/api/${apiPath}/carts`;
      axios.delete(url).then((response) => {
        this.isProcessing = true;
        alert(response.data.message);
        this.getCart();
        this.isProcessing = false;
      }).catch((err) => {
        alert(err.data.message);
      });
    },
    updateCartItem(item) {
      const data = {
        product_id: item.id,
        qty: item.qty,
      };
      this.isLoadingItem = item.id;
      axios.put(`${apiUrl}/api/${apiPath}/cart/${item.id}`, { data })
      .then((res) => {
        console.log(res);
        this.getCart();
        this.isLoadingItem = '';
      });
    },
    createOrder() {
      const url = `${apiUrl}/api/${apiPath}/order`;
      const order = this.form;
      axios.post(url, { data: order }).then((response) => {
        this.isProcessing = true;
        alert(response.data.message);
        this.$refs.form.resetForm();
        this.getCart();
      }).catch((err) => {
        alert(err.data.message);
      });
    },
  },
});

// $refs
app.component('product-modal', {
  props: ['id'],
  template: '#userProductModal',
  data() {
    return {
      modal: {},
      product: {},
      qty: 1,
    };
  },
  mounted() {
    this.modal = new bootstrap.Modal(this.$refs.modal);
  },
  methods: {
    getProducts() {
      axios.get(`${apiUrl}/api/${apiPath}/product/${this.id}`).then((res) => {
        // console.log(res);
        this.product = res.data.product;
      });
    },
    openModal() {
      this.modal.show();
    },
    closeModal() {
      this.modal.hide();
    },
    addToCart() {
      this.$emit('add-cart', this.product.id, this.qty)
    }
  },
  watch: {
    id() {
      // console.log(this.id)
      this.getProducts();
    },
  },
});

app.component('VForm', VeeValidate.Form);
app.component('VField', VeeValidate.Field);
app.component('ErrorMessage', VeeValidate.ErrorMessage);

app.mount('#app');
