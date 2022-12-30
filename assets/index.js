$(function () {
  getCoinList
    .done((coins) => {
      fullCoinList = coins;
      createCoinList(coins);
      loadWatchList();
    })
    .fail((err) => console.log(err.responseText));

  $("#loadingRTMdata").hide();
});
// ======================================= Variable
let watchList = []; // source of true -> keep track on user watch list
const sticky = $(".navbar").offset().top;
let fullCoinList = []; // array of home page coins view -> for sorting them

// ======================================= Events
$(window).mousemove(parallaxMouse);
$(window).mousemove(aboutParallax);
$(window).scroll(stickyNavbar);
$(window).scroll(parallaxScroll);

$("#coinList").on("click", ".moreInfo", handleCache);
$("#saveChanges").click(ChangeOffCanvas);
$("#watchList").click(() => renderWatchList(watchList));
$("#liveReports").click(handleLiveReports);
$("#search").keyup($.debounce(350, search));
$("#sortByValue").click(sortCoins);
$("#sortByValue").hover(sortHover);
$("#navbarContent a").each((i, a) => {
  $(a).click(changeScreens);
});
$("#backToCoins").click(changeScreens);

// =================================== general functions ===================================//

// parallax header -> mouse move
function parallaxMouse(e) {
  let _w = window.innerWidth / 2;
  let _h = window.innerHeight / 2;
  let _mouseX = e.clientX;
  let _mouseY = e.clientY;

  let _depth1 = `${50 - (_mouseX - _w) * 0.01}% ${50 - (_mouseY - _h) * 0.01}%`;

  let _depth2 = `${50 - (_mouseX - _w) * 0.02}% ${50 - (_mouseY - _h) * 0.02}%`;

  let _depth3 = `${50 - (_mouseX - _w) * 0.06}% ${50 - (_mouseY - _h) * 0.06}%`;

  let x = `${_depth3}, ${_depth2}, ${_depth1}`;
  let y = `${(_mouseX - _w) * 0.005}%`;
  let z = `${(_mouseY - _h) * 0.005}`;

  $("#parallax").css("backgroundPosition", x);
  $("#bitcoinParallax").css({ top: y, left: y });
}
// parallax header -> mouse scroll
function parallaxScroll() {
  var scrolled = $(window).scrollTop();
  $(".Scroll_wrapper").css("top", -(scrolled * 0.1) + "px");
  $("header .content").css("top", 0 + scrolled * 0.1 + "%");
  $("header .content").css("opacity", 1 - (scrolled * 0.01) / 10);
  $("header .content").css("opacity", 1 - (scrolled * 0.01) / 10);
}

//sticky navbar
function stickyNavbar() {
  if (window.pageYOffset >= sticky) {
    $(".navbar").addClass("sticky");
  } else {
    $(".navbar").removeClass("sticky");
  }
}

//handle switch between screens
function changeScreens() {
  const element = this.target;
  $("section").addClass("d-none");
  $(`${element}`).removeClass("d-none");

  //check if watchList not empty before loading report screen
  if (element == "#reports" && watchList < 1) {
    $("#noCoinsScreen").removeClass("d-none");
    $(`${element}`).addClass("d-none");
  }
  //hide search for not relevant screen
  if (element == "#reports" || element == "#about") {
    $("#search").hide();
    $(".subMenu").hide();
  } else {
    $("#search").show();
    $(".subMenu").show();
  }
  //switch header for about screen
  if (element == "#about") {
    $("#mainHeader").addClass("d-none");
    $("#aboutHeader").removeClass("d-none");
  } else {
    $("#mainHeader").removeClass("d-none");
    $("#aboutHeader").addClass("d-none");
  }

  return element;
}

// =================================== main coins view section ===================================//

//load Watch list on page render
function loadWatchList() {
  caches.has("watchlist").then((hasCache) => {
    if (hasCache) {
      caches.match("watchlist").then((resolve) => {
        return resolve.text().then((data) => {
          dataArr = data.split(",");
          if (dataArr != "") {
            watchList = dataArr;
            renderWatchList(watchList);
            ChangeOffCanvas();
          }
        });
      });
    }
  });
}

// update cache storage
function UpdateStorageWatchList(watchList) {
  caches.open("watchlist").then((cache) => {
    cache.put("watchlist", new Response(watchList));
  });
}

// search on keyUp -> with debounce of 350 mil'sc
function search(e) {
  const search = e.target.value.toLowerCase();
  $(".coinList")
    .children()
    .each((i, div) => {
      const targetCoin = div.attributes.target.value;
      if (targetCoin.indexOf(search) > -1) {
        $(div).removeClass("d-none");
      } else {
        $(div).addClass("d-none");
      }
    });
}

//sort coin function
function sortCoins() {
  $(".coinList").html("");
  fullCoinList.sort(sortByValue);
  createCoinList(fullCoinList);
  ChangeOffCanvas();
}

// sort by value method
function sortByValue(a, b) {
  if (a.current_price < b.current_price) {
    return 1;
  } else if (a.current_price > b.current_price) {
    return -1;
  } else {
    return 0;
  }
}

//change sort BTN text
function sortHover() {
  if ($("#sortByValue").html() == "Sort By Coin Value") {
    $("#sortByValue").html("From High To Low");
  } else {
    $("#sortByValue").html("Sort By Coin Value");
  }
}

// get data for full coin list
const getCoinList = $.getJSON({
  type: "GET",
  dataType: "json",
  url: "https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=100&page=1&sparkline=false&price_change_percentage=7d",
});

//remove numbers form first chart of coin.id -> to prevent ID error
function getID(id) {
  /[0-9]/.test(id.slice(0, 1)) ? (id = id.slice(1)) : (id = id);
  return id;
}
// create and render coin list
function createCoinList(coins) {
  $(coins).each((i, coin) => {
    let id = coin.id;
    // let newID = coin.id;
    newID = getID(coin.id);
    $(".coinList").append(
      ` <!-- card ${i} -->
                <div class="card col-lg-3 m-1 p-1" target = "${coin.symbol} ${coin.id}">
                  <div class="row">
                    <div class="col-4 d-flex justify-content-center align-items-center">
                      <img class="w-75" src="${coin.image}"/>
                    </div>
                    <div class="col-8 card-content">
                      <div class="card-body">
                        <h5 class="card-title">${coin.symbol}</h5>
                        <p class="card-text">${coin.name}.</p>
                        <p class="card-text">Value ${coin.current_price}$</p>
                        <div class="form-check form-switch">
                          <input
                            class="form-check-input"
                            type="checkbox"
                            role="switch"
                            
                            id="addToggle${coin.symbol}"
                            onClick="handleWatchList('${coin.symbol}')"
                            
                          />
                          <label
                            class="form-check-label text-muted fs-6"
                            for="addToggle"
                            >Add to watch list</label
                          >
                        </div>
                      </div>
                      <button
                        class="moreInfo btn btn-primary collapsed ms-3 mb-1 ${newID}"
                        type="button"
                        data-bs-toggle="collapse"
                        data-bs-target="#${newID}"
                        aria-expanded="false"
                        title="${coin.id}"
                      >
                        <div class="spinner-border ${id}Spinner">
                        <span class="visually-hidden">Loading...</span>
                        </div>
                        <span class="MoreInfoText${id}">
                        More Info
                        </span>
                      </button>
                      <div class="collapse" id="${newID}">
                        <div class=" card card-body border-0">
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
      `
    );
    $(`.${id}Spinner`).hide();
  });
}

//handle watchlist -> on-checkBox selection add coin to watchList
function handleWatchList(symbol) {
  const that = $(`#addToggle${symbol}`)[0];

  if (that.checked == true && watchList.length < 5) {
    watchList.push(symbol);
  } else if (that.checked != true) {
    watchList.splice(watchList.indexOf(symbol), 1);
  } else if (that.checked == true && watchList.length == 5) {
    that.checked = false;
    $("#watchList").click();
    $("#maxFive").addClass("text-danger fw-bold");
    SaveOrCancel(symbol);
  }
  UpdateStorageWatchList(watchList);
}

// handle save or cancel changes when user get to more then 5 coins
function SaveOrCancel(symbol) {
  ChangeOffCanvas();
  $("#saveChanges").one("click", () => {
    const that = $(`#addToggle${symbol}`)[0];
    if (watchList.length < 5) {
      watchList.push(symbol);
      that.checked = true;
    }
    $("#maxFive").removeClass("text-danger fw-bold");
  });
  $("#cancelChanges").one("click", () => {
    $("#maxFive").removeClass("text-danger fw-bold");
  });
  UpdateStorageWatchList(watchList);
}

//render Watchlist to Offcanves
function renderWatchList(watchList) {
  $("#watchListBody").html("");
  $(watchList).each(function (i, li) {
    $("#watchListBody").append(`<div class="form-check form-switch">
    <input
      class="form-check-input"
      type="checkbox"
      role="switch"
      id="${li}"
      checked
    />
    <label
      class="form-check-label text-muted fs-6"
      for="addToggle"
      >${li}</label
    >
  </div>`);
  });
}

// render changes on offCanves watchlist and on main screen coins view
function ChangeOffCanvas() {
  const lis = $("#watchListBody").children().children("input");

  $.each(lis, (i, li) => {
    if (li.checked != true) {
      watchList.splice(watchList.indexOf(li.id), 1);
      $("div").children(`#addToggle${li.id}`)[0].checked = false;
      UpdateStorageWatchList(watchList);
    } else {
      $("div").children(`#addToggle${li.id}`)[0].checked = true;
    }
  });
  renderWatchList(watchList);
}
// toggle "more info" btn text
function toggleMoreInfo(id) {
  let btnText = $(`.MoreInfoText${id}`);
  if ($(btnText).text().includes("More")) {
    $(btnText).text("Less info");
  } else {
    $(btnText).text("More info");
  }
}
// toggle "active" class to inner "more info" categories
function toggleActive(event) {
  $(event.target)
    .addClass("active-info")
    .siblings("button")
    .removeClass("active-info");
}

//handleCache for "More info"
async function handleCache() {
  const id = this.title;

  let btnStatus = $(this).children(`.MoreInfoText${id}`).text().includes("More")
    ? true
    : false;
  if (btnStatus) {
    toggleMoreInfo(id);
    try {
      $(`.${id}Spinner`).show("fast");
      let url = `https://api.coingecko.com/api/v3/coins/${id}`;
      caches.has(id).then(async (hasCache) => {
        if (hasCache) {
          // time validation
          let cacheTime;
          const now = new Date().getTime();
          await caches.match("time-cached").then(async (resolve) => {
            return resolve.text().then((time) => {
              cacheTime = time;
            });
          });
          if (now - cacheTime < 120000) {
            await caches.match(id).then((res) => {
              res.json().then((data) => createMoreInfo(data, id));
              getCandleChartData(id, (cacheStatus = true));
            });
          } else {
            await openCache(url);
          }
        } else {
          await openCache(url);
        }
      });
    } catch (err) {
      console, log(err);
    } finally {
      $(`.${id}Spinner`).hide("slow");
    }
  } else {
    toggleMoreInfo(id);
  }

  async function openCache(url) {
    await caches.open(id).then(async (cache) => {
      await fetch(url)
        .then(async (response) => {
          cache.put(
            "/project2/time-cached",
            new Response(new Date().getTime())
          );
          await cache.put(id, response);
          cache.match(id).then((resolve) => {
            resolve.json().then((data) => {
              createMoreInfo(data, id);
            });
            getCandleChartData(id, (cacheStatus = false));
          });
        })
        .catch((response) => {
          console.log(response.status + " cache deleted");
          caches.delete(id);
        });
    });
  }
}

// create and render "more info" section to cards
function createMoreInfo(data, id) {
  id = getID(id);
  $("#" + id).children()[0].innerHTML = `
    <div id="carouselIndicators${id}" class="carousel slide" data-bs-ride="true">
    <div>
      <button class="btn show-more-slide" type="button" data-bs-target="#carouselIndicators${id}" data-bs-slide-to="0" aria-label="Slide 1" onclick = "toggleActive(event)">Description</button>
      <button class="btn show-more-slide" type="button" data-bs-target="#carouselIndicators${id}" data-bs-slide-to="1" aria-label="Slide 2" onclick = "toggleActive(event)"> Value</button>
      <button class="btn show-more-slide" type="button" 
      data-bs-toggle="modal" data-bs-target="#modal${id}"
      onclick = "toggleActive(event)"> Trands</button>
    </div>
    <div class="carousel-inner coin-info">
      <div class="carousel-item active" data-bs-interval="9999999999999999">
        <p> ${data.description.bg}</p>
      </div>
      <div class="carousel-item" data-bs-interval="9999999999999999">
      <p class="mb-2"> Israel shekel: ${data.market_data.current_price.ils} <small>₪</small></p>
      <p class="mb-2"> American dollar: ${data.market_data.current_price.usd} <small>$</small></p>
      <p> European Euro: ${data.market_data.current_price.eur} <small>€</small></p>

      </div>
      <div class="modal fade" id="modal${id}" tabindex="-1" aria-hidden="true">
  <div class="modal-dialog ">
    <div class="modal-content">
      <div class="modal-header">
        <h1 class="modal-title fs-5" id="exampleModalLabel">${id} Candlestick</h1>
        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
      </div>
      <div class="modal-body" id="chartContainer${id}">

      </div>
    </div>
  </div>
</div>
    </div>
  </div>
`;
}

// get "more info" candlestick chart data
function getCandleChartData(id, cacheStatus) {
  let url = `https://api.coingecko.com/api/v3/coins/${id}/ohlc?vs_currency=usd&days=7`;
  if (cacheStatus) {
    caches.has(`${id}Chart`).then(async (hasCache) => {
      if (hasCache) {
        await caches.match(`${id}Chart`).then((res) => {
          res.json().then((data) => createChart(data, id));
        });
      }
    });
  } else {
    caches.open(`${id}Chart`).then(async (cache) => {
      await fetch(url)
        .then(async (response) => {
          await cache.put(`${id}Chart`, response);
          cache.match(`${id}Chart`).then((res) => {
            res.json().then((data) => createChart(data, id));
          });
        })
        .catch((response) => {
          console.log(response.status + " cache deleted");
          caches.delete(`${id}Chart`);
        });
    });
  }
}
// convert "more info" candleStick chart data to workable data formation
function chartDataPoints(data) {
  let dataPoints = [];
  $.each(data, function (key, value) {
    dataPoints.push({
      x: new Date(value[0]),
      y: value.slice(1),
    });
  });
  return dataPoints;
}

//create and render "more info" candleStick chart to card
function createChart(data, id) {
  id = getID(id);

  const dataPoints = chartDataPoints(data);
  const chart = new CanvasJS.Chart(`chartContainer${id}`, {
    options: {
      animationEnabled: true,
      theme: "light2",
      exportEnabled: true,
      showInLegend: true,
    },
    axisX: {
      valueFormatString: "DDD",
    },
    axisY: {
      prefix: "$",
      title: "Price (in USD)",
    },
    data: [
      {
        type: "candlestick",
        yValueFormatString: "$###0.00####",
        xValueFormatString: "DDD",
        dataPoints: dataPoints,
      },
    ],
  });
  chart.render();
}

// =================================== live reports section ===================================//

//handle switch to "live reports"
function handleLiveReports() {
  const screen = $("#reports")[0];
  changeScreens(screen);
  getRTMdata();
  getCandleCompareInfo();
}

//  Real time Chart & circulation pai chart //
//switch coin id to capital for API search
function ListToCapital() {
  const CapitalList = watchList.map((coin) => coin.toUpperCase());
  return CapitalList;
}

//get real time data from API
async function getRTMdata() {
  let capitalList = ListToCapital();
  const comparePriceChart = [];
  const compareCandleChart = [];
  let compareCirculation = [];

  if (watchList.length > 0) {
    $.getJSON({
      type: "GET",
      dataType: "json",
      Apikey:
        "613363e8db98acbc51988b3e24466760f96ec7e8d74e971b4ccd86bfc339e793",
      url: `https://min-api.cryptocompare.com/data/pricemultifull?fsyms=${capitalList},&tsyms=USD`,
    })
      //Compare Price Chart
      .done((data) => {
        $.each(data.RAW, (key, value) => {
          comparePriceChart.push(value.USD.PRICE);
        });
        RTMprogressBar();
        RTMcompareChart(comparePriceChart);
      })
      // Compare Circulation and Supply
      .done((data) => {
        $.each(data.RAW, (key, value) => {
          compareCirculation.push({
            name: key,
            supply: value.USD.SUPPLY,
            circulated: value.USD.CIRCULATINGSUPPLY,
          });
        });
        $("#circulationContainer").html("");
        $("#circulationContainer").append(
          `<h2 class='text-center mb-4'>Circulation & Supply Chart </h2>
          <div class='row' id='cont1'></div>
          <div class='row' id='cont2'></div>`
        );
        $.each(compareCirculation, (index, coin) => {
          circulation(coin);
        });
      })
      .fail((err) => {
        console.log(err.responseJSON.error);
      });
  }
}

// Loading RTM Data - > show progress bar while fetching first few call to render

function RTMprogressBar() {
  $("#chartRTMContainer").hide();
  $(".RTMsub").hide();
  $("#loadingRTMdata").show();

  $(".progressbar .progress").removeAttr("style");
  $(".counter").removeAttr("style");

  $(".progressbar .progress").animate({ width: "100%" }, 20000, function () {});

  $(".counter")
    .delay(2000)
    .animate(
      {
        left: 440,
        Counter: $(this).text(),
      },
      18200,
      function () {
        $("#chartRTMContainer").show();
        $(".RTMsub").show();
        $("#loadingRTMdata").hide();
      }
    );

  $({ Counter: 0 }).animate(
    {
      Counter: $(".counter").text(),
    },
    {
      duration: 20000,
      easing: "swing",
      step: function () {
        $(".counter").text(Math.ceil(this.Counter));
      },
    }
  );
}

// create and render real time Compare Price Chart
function RTMcompareChart(comparePriceChart) {
  let capitalList = ListToCapital();
  const dataPoints1 = [];
  const dataPoints2 = [];
  const dataPoints3 = [];
  const dataPoints4 = [];
  const dataPoints5 = [];
  // initial value
  let yValue = [];
  for (let i = 0; i < capitalList.length; i++) {
    yValue.push(comparePriceChart[i]);
  }
  const maxDataOption = [
    {
      type: "line",
      xValueType: "dateTime",
      yValueFormatString: "####.####$",
      xValueFormatString: "hh:mm:ss TT",
      showInLegend: true,
      name: capitalList[0],
      dataPoints: dataPoints1,
      color: "#000",
    },
    {
      type: "line",
      xValueType: "dateTime",
      yValueFormatString: "####.####$",
      showInLegend: true,
      name: capitalList[1],
      dataPoints: dataPoints2,
      color: "#ffc107",
    },
    {
      type: "line",
      xValueType: "dateTime",
      yValueFormatString: "####.####$",
      showInLegend: true,
      name: capitalList[2],
      dataPoints: dataPoints3,
      color: "#C58940",
    },
    {
      type: "line",
      xValueType: "dateTime",
      yValueFormatString: "####.####$",
      showInLegend: true,
      name: capitalList[3],
      dataPoints: dataPoints4,
      color: "#B2B2B2",
    },
    {
      type: "line",
      xValueType: "dateTime",
      yValueFormatString: "####.####$",
      showInLegend: true,
      name: capitalList[4],
      dataPoints: dataPoints5,
      color: "#FF7000",
    },
  ];
  const dataOptions = [];
  for (let i = 0; i < capitalList.length; i++) {
    dataOptions.push(maxDataOption[i]);
  }

  let options = {
    exportEnabled: true,
    with: 1296,
    toolbar: {
      itemBackgroundColor: "#fff",
      buttonBorderColor: "#eccaa0",
      buttonBorderThickness: 2,
      fontColor: "#000000",
      fontColorOnHover: "#ffffff",
    },
    axisX: {
      title: "updates every 5 secs",
    },
    axisY: {
      suffix: "$",
      includeZero: false,
    },
    toolTip: {
      shared: true,
    },
    legend: {
      cursor: "pointer",
      verticalAlign: "top",
      fontSize: 22,
      fontColor: "dimGrey",
      itemclick: toggleDataSeries,
    },
    data: dataOptions,
  };
  let chart = new CanvasJS.Chart("chartRTMContainer", options);

  function toggleDataSeries(e) {
    if (typeof e.dataSeries.visible === "undefined" || e.dataSeries.visible) {
      e.dataSeries.visible = false;
    } else {
      e.dataSeries.visible = true;
    }
    e.chart.render();
  }

  let updateInterval = 5000;

  let time = new Date();

  //UPDATE CHART DATA
  function updateChart(updateData, count) {
    count = count || 1;
    for (let i = 0; i < count; i++) {
      time.setTime(time.getTime() + updateInterval);

      // pushing the new values

      dataPoints1.push({
        x: time.getTime(),
        y: updateData[0],
      });
      dataPoints2.push({
        x: time.getTime(),
        y: updateData[1],
      });
      dataPoints3.push({
        x: time.getTime(),
        y: updateData[2],
      });
      dataPoints4.push({
        x: time.getTime(),
        y: updateData[3],
      });
      dataPoints5.push({
        x: time.getTime(),
        y: updateData[4],
      });
    }

    // updating legend text with  updated with y Value

    for (let i = 0; i < capitalList.length; i++) {
      options.data[i].legendText = capitalList[i] + " : " + yValue[i] + "$";
    }

    chart.render();

    $("canvas")[0].getContext("2d", { willReadFrequently: true });
  }
  // generates first set of dataPoints
  updateChart(100);
  setInterval(function () {
    $.getJSON({
      type: "GET",
      dataType: "json",
      url: `https://min-api.cryptocompare.com/data/pricemultifull?fsyms=${capitalList},&tsyms=USD`,
    })
      .done((data) => {
        let updateData = [];
        $.each(data.RAW, (key, value) => {
          updateData.push(value.USD.PRICE);
        });
        updateChart(updateData);
      })
      .fail((err) => {
        console.log(err.responseJSON.error);
      });
  }, updateInterval);
}

// create and render Circulation and Supply Chart

function circulation(coin) {
  $("#cont1").children().length < 3
    ? $("#cont1").append(
        `<div class="circulationChart col-lg-4 col-md-6 col-sm-10"  id="circulation${coin.name}"></div>`
      )
    : $("#cont2").append(
        `<div class="circulationChart col-lg-4 col-md-6 col-sm-10"  id="circulation${coin.name}"></div>`
      );

  const paiData = [];
  paiData.push(
    {
      name: "supply",
      y: coin.supply,
      percentage: coin.supply,
      color: "#000000",
    },
    {
      name: "circulated",
      y: coin.circulated,
      percentage: (coin.circulated / coin.supply) * 100 + "%",
      color: "#ffc107",
    }
  );

  var chart = new CanvasJS.Chart(`circulation${coin.name}`, {
    exportEnabled: true,
    animationEnabled: true,
    title: {
      text: coin.name,
    },
    legend: {
      cursor: "pointer",
      itemclick: explodePie,
    },
    data: [
      {
        type: "pie",
        showInLegend: true,
        toolTipContent: "{name}: <strong>{percentage}</strong>",
        indexLabel: "{name} - {y}",
        dataPoints: paiData,
        color: "{color}",
      },
    ],
  });
  chart.render();
}

function explodePie(e) {
  if (
    typeof e.dataSeries.dataPoints[e.dataPointIndex].exploded === "undefined" ||
    !e.dataSeries.dataPoints[e.dataPointIndex].exploded
  ) {
    e.dataSeries.dataPoints[e.dataPointIndex].exploded = true;
  } else {
    e.dataSeries.dataPoints[e.dataPointIndex].exploded = false;
  }
  e.chart.render();
}

// get candleStick comparison data from Api
async function getCandleCompareInfo() {
  let capitalList = ListToCapital();
  const CoinsData = [];
  await $.each(capitalList, (index, coinSymbole) => {
    $.getJSON({
      type: "GET",
      dataType: "json",
      Apikey:
        "613363e8db98acbc51988b3e24466760f96ec7e8d74e971b4ccd86bfc339e793",
      url: `https://min-api.cryptocompare.com/data/v2/histoday?fsym=${coinSymbole}&tsym=USD&limit=30`,
    })

      .done(async (data) => {
        CoinsData.push(data.Data.Data);
        candleStickCompare(CoinsData);
      })
      .fail((err) => {
        console.log(err.responseJSON.error);
      });
  });
}

// create and render compare candleStick
function candleStickCompare(CoinsData) {
  let capitalList = ListToCapital();

  const x = [];
  const close = [];
  const high = [];
  const low = [];
  const open = [];

  for (let i = 0; i < watchList.length; i++) {
    let X = [];
    let Close = [];
    let High = [];
    let Low = [];
    let Open = [];
    $.each(CoinsData[i], async (index, data) => {
      let time = new Date(data.time * 1000).toLocaleDateString();
      X.push(time);
      Close.push(data.close);
      High.push(data.high);
      Low.push(data.low);
      Open.push(data.open);
    });
    x.push(X);
    close.push(Close);
    high.push(High);
    low.push(Low);
    open.push(Open);
  }
  //  ---------------------- Coin 1 --------------------//
  const trace1 = {
    x: x[0],
    close: close[0],
    high: high[0],
    low: low[0],
    open: open[0],
    // cutomise colors
    increasing: { line: { color: "#000000" } },
    decreasing: { line: { color: "#ffc107" } },
    type: "candlestick",
    xaxis: "x",
    yaxis: "y",
    name: capitalList[0],
  };
  //  ---------------------- Coin 2 --------------------//
  const trace2 = {
    x: x[1],
    close: close[1],
    high: high[1],
    low: low[1],
    open: open[1],

    // cutomise colors
    increasing: { line: { color: "#FFE9A0" } },
    decreasing: { line: { color: "#E8DFCA" } },
    type: "candlestick",
    xaxis: "x",
    yaxis: "y",
    name: capitalList[1],
  };
  //  ---------------------- Coin 3 --------------------//
  const trace3 = {
    x: x[2],
    close: close[2],
    high: high[2],
    low: low[2],
    open: open[2],

    // cutomise colors
    increasing: { line: { color: "#FF7000" } },
    decreasing: { line: { color: "#344D67" } },
    type: "candlestick",
    xaxis: "x",
    yaxis: "y",
    name: capitalList[2],
  };
  //  ---------------------- Coin 4 --------------------//
  const trace4 = {
    x: x[3],
    close: close[3],
    high: high[3],
    low: low[3],
    open: open[3],

    // cutomise colors
    increasing: { line: { color: "#B7C4CF" } },
    decreasing: { line: { color: "#967E76" } },
    type: "candlestick",
    xaxis: "x",
    yaxis: "y",
    name: capitalList[3],
  };
  //  ---------------------- Coin 5 --------------------//
  const trace5 = {
    x: x[4],
    close: close[4],
    high: high[4],
    low: low[4],
    open: open[4],

    // cutomise colors
    increasing: { line: { color: "#F1A661" } },
    decreasing: { line: { color: "#553939" } },
    type: "candlestick",
    xaxis: "x",
    yaxis: "y",
    name: capitalList[4],
  };

  const traceArr = [trace1, trace2, trace3, trace4, trace5];
  const plotlyData = [];
  for (let i = 0; i < watchList.length; i++) {
    plotlyData.push(traceArr[i]);
  }
  const data = plotlyData;

  const layout = {
    dragmode: "zoom",
    showlegend: true,

    xaxis: {
      rangeslider: {
        visible: true,
      },
    },
  };

  Plotly.newPlot("myCandleStick", data, layout, { responsive: true });
}

// =================================== About me section ===================================//
//about me parallax
function aboutParallax(e) {
  let _w = window.innerWidth / 2;
  let _h = window.innerHeight / 2;
  let _mouseX = e.clientX;
  let _mouseY = e.clientY;

  let _depth1 = `${50 - (_mouseX - _w) * 0.01}% ${50 - (_mouseY - _h) * 0.01}%`;

  let _depth2 = `${50 - (_mouseX - _w) * 0.02}% ${50 - (_mouseY - _h) * 0.02}%`;

  let _depth3 = `${50 - (_mouseX - _w) * 0.06}% ${50 - (_mouseY - _h) * 0.06}%`;

  let x = `${_depth3}, ${_depth2}, ${_depth1}`;
  let y = `${(_mouseX - _w) * 0.005}%`;
  let z = `${(_mouseY - _h) * 0.005}`;

  $("#aboutParallax").css("backgroundPosition", x);
  $("#imageParallax").css({ top: y, left: y });
}
