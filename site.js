(function () {
  var clock = document.querySelector("[data-clock]");
  var links = Array.prototype.slice.call(document.querySelectorAll("nav a"));
  var sections = links
    .map(function (link) {
      return document.querySelector(link.getAttribute("href"));
    })
    .filter(Boolean);

  function paintClock() {
    if (!clock) return;
    var time = new Intl.DateTimeFormat("en-GB", {
      hour: "2-digit",
      minute: "2-digit",
      hourCycle: "h23",
      timeZone: "Asia/Manila"
    }).format(new Date());
    clock.textContent = time + " · Calamba";
  }

  paintClock();
  window.setInterval(paintClock, 30000);

  if ("IntersectionObserver" in window && sections.length) {
    var watcher = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          var id = "#" + entry.target.id;
          links.forEach(function (link) {
            link.classList.toggle("is-current", link.getAttribute("href") === id);
          });
        });
      },
      { rootMargin: "-42% 0px -48% 0px", threshold: 0.01 }
    );
    sections.forEach(function (section) {
      watcher.observe(section);
    });
  }
})();
