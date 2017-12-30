function deletePortfolio(portfolioID) {
    $.ajax({
        url: '/api/v1/dht/portfolios/?hkey=' + portfolioID,
        type: 'DELETE',
        success: function(result) {
            $('.portfolio[portfolioID="'+ portfolioID +'"]').fadeOut(300);
            console.log('veikia');
        }
    });
}