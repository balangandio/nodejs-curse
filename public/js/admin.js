const deleteProduct = (btn) => {
    const prodId = btn.parentNode.querySelector('[name=productId]').value;
    const csrf = btn.parentNode.querySelector('[name=_csrf]').value;

    const productElement = btn.closest('article');

    fetch(`/admin/product/${prodId}`, {
        method: 'DELETE',
        headers: { 'csrf-token': csrf }
    }).then(result => {
        return result.json();
    }).then(({ message }) => {
        console.log(message);

        productElement.parentNode.removeChild(productElement);
    }).catch(console.log);
};