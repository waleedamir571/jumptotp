/**
 * JumpToTop — script.js
 * jQuery interactions: tabs, accordion, testimonials, navbar, form
 */
$(function () {

  /* ================================================
     NAVBAR SCROLL SHADOW
     ================================================ */
  $(window).on('scroll.nav', function () {
    if ($(this).scrollTop() > 10) {
      $('#navbar').css('box-shadow', '0 4px 20px rgba(0,0,0,0.12)');
    } else {
      $('#navbar').css('box-shadow', '0 2px 10px rgba(0,0,0,0.06)');
    }
  });

  /* ================================================
     HAMBURGER
     ================================================ */
  $('#hamburger').on('click', function () {
    $(this).toggleClass('open');
    $('#mobile-nav').toggleClass('open');
  });
  $(document).on('click', function (e) {
    if (!$(e.target).closest('#navbar, #mobile-nav').length) {
      $('#hamburger').removeClass('open');
      $('#mobile-nav').removeClass('open');
    }
  });
  $('#mobile-nav a').on('click', function () {
    $('#hamburger').removeClass('open');
    $('#mobile-nav').removeClass('open');
  });

  /* ================================================
     SMOOTH SCROLL
     ================================================ */
  $('a[href^="#"]').on('click', function (e) {
    var tgt = $(this.getAttribute('href'));
    if (tgt.length) {
      e.preventDefault();
      $('html,body').animate({ scrollTop: tgt.offset().top - 80 }, 600);
    }
  });

  /* ================================================
     SERVICES TABS
     ================================================ */
  $('.tab-item').on('click', function () {
    var tabId = $(this).data('tab');
    $('.tab-item').removeClass('active');
    $(this).addClass('active');
    $('.tab-pane').removeClass('active');
    $('#tab-' + tabId).addClass('active');
  });

  /* ================================================
     TESTIMONIALS SWITCHER
     ================================================ */
  function switchTestimonial(id) {
    $('.testi-quote').removeClass('active');
    $('.testi-name-item').removeClass('active');
    $('[data-id="' + id + '"].testi-quote').addClass('active');
    $('[data-id="' + id + '"].testi-name-item').addClass('active');
  }

  $('#testiNames').on('click', '.testi-name-item', function () {
    switchTestimonial($(this).data('id'));
  });

  // Auto-rotate testimonials every 5s
  var testimonialIds = [];
  $('.testi-name-item').each(function () {
    testimonialIds.push($(this).data('id'));
  });
  var currentTesti = 0;
  setInterval(function () {
    currentTesti = (currentTesti + 1) % testimonialIds.length;
    switchTestimonial(testimonialIds[currentTesti]);
  }, 5000);

  /* ================================================
     FAQ ACCORDION
     ================================================ */
  $('#faqList').on('click', '.faq-q', function () {
    var $item = $(this).closest('.faq-item');
    var isOpen = $item.hasClass('open');
    // Close all
    $('.faq-item').removeClass('open');
    $('.faq-a').css('max-height', '0');
    // Open clicked
    if (!isOpen) {
      $item.addClass('open');
      $item.find('.faq-a').css('max-height', $item.find('.faq-a')[0].scrollHeight + 'px');
    }
  });

  // Open first FAQ
  var $first = $('.faq-item:first-child');
  $first.addClass('open');
  $first.find('.faq-a').css('max-height', $first.find('.faq-a')[0].scrollHeight + 'px');

  /* ================================================
     HERO & ANALYZER WEBSITE INPUT
     ================================================ */
  $('#heroAnalyze').on('click', function () {
    var url = $('#heroWebsite').val().trim();
    if (!url) {
      $('#heroWebsite').css('border-color', '#e53238');
      setTimeout(function () { $('#heroWebsite').css('border-color', '#ededed'); }, 2000);
      return;
    }
    var $btn = $(this);
    $btn.text('Analyzing...').prop('disabled', true);
    setTimeout(function () {
      $btn.text('Analysis Ready!').css('background', '#28a745').css('border-color', '#28a745');
      setTimeout(function () {
        $btn.text('Analyze Website').css('background', '#005eb8').css('border-color', '#005eb8').prop('disabled', false);
      }, 3000);
    }, 1800);
  });

  /* ================================================
     CONTACT FORM
     ================================================ */
  $('#btnSend').on('click', function () {
    var name  = $('#cfName').val().trim();
    var email = $('#cfEmail').val().trim();
    var msg   = $('#cfMessage').val().trim();
    var ok    = true;

    [name ? null : '#cfName', email ? null : '#cfEmail', msg ? null : '#cfMessage'].forEach(function (sel) {
      if (sel) { $(sel).css('border-color', '#e53238'); ok = false; }
    });

    if (!ok) {
      setTimeout(function () {
        ['#cfName','#cfEmail','#cfMessage'].forEach(function (s) { $(s).css('border-color', '#7a7a7a'); });
      }, 2500);
      return;
    }

    var $btn = $(this);
    $btn.text('Sending...').prop('disabled', true);
    setTimeout(function () {
      $btn.text('Message Sent!').addClass('success').prop('disabled', false);
      ['#cfName','#cfCompany','#cfEmail','#cfPhone','#cfMessage'].forEach(function (s) { $(s).val(''); });
      setTimeout(function () { $btn.text('Send Message').removeClass('success'); }, 3500);
    }, 1500);
  });

  /* ================================================
     SCROLL REVEAL ANIMATION
     ================================================ */
  $('<style>')
    .text('.reveal { opacity: 0; transform: translateY(28px);  } .reveal.visible { opacity: 1; transform: translateY(0); }')
    .appendTo('head');

  // Add reveal class
  $('.why-card, .metric-item, .proven-big-card, .faq-item, .testi-name-item').addClass('reveal');

  // Stagger siblings
  $('.why-card').each(function (i) { $(this).css('transition-delay', (i * 0.1) + 's'); });
  // $('.case-card').each(function (i) { $(this).css('transition-delay', (i * 0.08) + 's'); });

  var revealObs = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        $(entry.target).addClass('visible');
        revealObs.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -30px 0px' });

  document.querySelectorAll('.reveal').forEach(function (el) { 
    // Don't animate case-cards
    if (!el.classList.contains('case-card')) {
      revealObs.observe(el); 
    }
  });

  /* ================================================
     COUNTER ANIMATION FOR STATS
     ================================================ */
  function animateCounter($el, target, suffix) {
    var duration = 1600;
    var startTime = null;
    function step(ts) {
      if (!startTime) startTime = ts;
      var progress = Math.min((ts - startTime) / duration, 1);
      var eased = 1 - Math.pow(1 - progress, 3);
      var current = Math.round(target * eased);
      $el.find('.stat-num').text(current + suffix);
      if (progress < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }

  var statObserver = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting && !$(entry.target).hasClass('counted')) {
        $(entry.target).addClass('counted');
        var $s = $(entry.target);
        var numText = $s.find('.stat-num').text();
        if (numText.includes('%')) animateCounter($s, 15, '%');
        else if (numText.includes('K')) {
          var d = 1600, st = null;
          (function go(ts) {
            if (!st) st = ts;
            var p = Math.min((ts - st) / d, 1);
            var e = 1 - Math.pow(1 - p, 3);
            $s.find('.stat-num').text(Math.round(94 * e) + 'K');
            if (p < 1) requestAnimationFrame(go);
          })(performance.now());
        } else if (numText.includes('+')) animateCounter($s, 30, '+');
      }
    });
  }, { threshold: 0.5 });

  document.querySelectorAll('.stat-block').forEach(function (el) { statObserver.observe(el); });

  /* ================================================
     ACTIVE INPUT HIGHLIGHT (form)
     ================================================ */
  $('.cf-input, .cf-textarea').on('focus', function () {
    $(this).css('border-color', '#005eb8').css('color', '#005eb8');
  }).on('blur', function () {
    if (!$(this).val()) {
      $(this).css('border-color', '#7a7a7a').css('color', '#7a7a7a');
    }
  });
  // First field starts active
  $('#cfName').css('border-color', '#005eb8').css('color', '#005eb8');

});
