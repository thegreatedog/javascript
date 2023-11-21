const sendRequestFunction = async (url, body, method, cookie) => {
  try {
    const someResponse = await fetch(url, {
      method: method ? method : 'GET',
      body: body,
      headers: {
        accept:
          'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7',
        'accept-language': 'ru-RU,ru;q=0.9,en-US;q=0.8,en;q=0.7,uk;q=0.6',
        'upgrade-insecure-requests': '1',
        cookie: `__utmz=163308157.1687681435.1.1.utmcsr=(direct)|utmccn=(direct)|utmcmd=(none); ${cookie}; __utmc=163308157; __utma=163308157.1173496640.1687681435.1692868845.1692872191.23; __utmt=1; __utmb=163308157.1.10.1692872191`,
      },
    });

    return someResponse;
  } catch (error) {
    console.log('Error sending request:', error);
    throw error;
  }
};
module.exports = sendRequestFunction;
