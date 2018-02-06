// LOADS ALL GIGS TO PROFILE PAGE
function loadPortfoliosToProfile() {

    getNodeData(function(nodeData) {
        $data = JSON.parse(nodeData);
        $profileID = $data.guid;

        getProfilePortfolios($profileID, function(data) {
            $data = JSON.parse(data);

            $($data).each(function(i, portfolioID) {

                getDHTData(portfolioID, function(portfolioData) {
                    $data = JSON.parse(portfolioData);
                    createPortfolio($data, portfolioID);
                });
            })
        })
    });
}

loadPortfoliosToProfile();