const handler = (req, res) => {
    res.write('<html>');
    res.write('<body>');
    res.write('<h1>something here...</h1>');
    res.write('</body>');
    res.write('</html>');
    res.end();
};

module.exports = { handler };
