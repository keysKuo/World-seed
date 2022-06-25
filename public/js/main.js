// const { normalizeDateAndTime } = require("../../libs/functions");

(function($) {

	'use strict';

	// bootstrap dropdown hover

  // loader
  var loader = function() {
    setTimeout(function() { 
      if($('#loader').length > 0) {
        $('#loader').removeClass('show');
      }
    }, 1);
  };
  loader();

  // Stellar
  $(window).stellar();

	
	$('nav .dropdown').hover(function(){
		var $this = $(this);
		$this.addClass('show');
		$this.find('> a').attr('aria-expanded', true);
		$this.find('.dropdown-menu').addClass('show');
	}, function(){
		var $this = $(this);
			$this.removeClass('show');
			$this.find('> a').attr('aria-expanded', false);
			$this.find('.dropdown-menu').removeClass('show');
	});


	$('#dropdown04').on('show.bs.dropdown', function () {
	  console.log('show');
	});



	// home slider
	$('.home-slider').owlCarousel({
    loop:true,
    autoplay: true,
    margin:10,
    animateOut: 'fadeOut',
    animateIn: 'fadeIn',
    nav:true,
    autoplayHoverPause: true,
    items: 1,
    navText : ["<span class='ion-chevron-left'></span>","<span class='ion-chevron-right'></span>"],
    responsive:{
      0:{
        items:1,
        nav:false
      },
      600:{
        items:1,
        nav:false
      },
      1000:{
        items:1,
        nav:true
      }
    }
	});

	// owl carousel
	var majorCarousel = $('.js-carousel-1');
	majorCarousel.owlCarousel({
    loop:true,
    autoplay: false,
    stagePadding: 0,
    margin: 10,
    animateOut: 'fadeOut',
    animateIn: 'fadeIn',
    nav: false,
    dots: false,
    autoplayHoverPause: false,
    items: 3,
    responsive:{
      0:{
        items:1,
        nav:false
      },
      600:{
        items:2,
        nav:false
      },
      1000:{
        items:3,
        nav:true,
        loop:false
      }
  	}
	});

  // cusotm owl navigation events
  $('.custom-next').click(function(event){
    event.preventDefault();
    // majorCarousel.trigger('owl.next');
    majorCarousel.trigger('next.owl.carousel');

  })
  $('.custom-prev').click(function(event){
    event.preventDefault();
    // majorCarousel.trigger('owl.prev');
    majorCarousel.trigger('prev.owl.carousel');
  })

	// owl carousel
	var major2Carousel = $('.js-carousel-2');
	major2Carousel.owlCarousel({
    loop:true,
    autoplay: true,
    stagePadding: 7,
    margin: 20,
    animateOut: 'fadeOut',
    animateIn: 'fadeIn',
    nav: false,
    autoplayHoverPause: true,
    items: 4,
    navText : ["<span class='ion-chevron-left'></span>","<span class='ion-chevron-right'></span>"],
    responsive:{
      0:{
        items:1,
        nav:false
      },
      600:{
        items:3,
        nav:false
      },
      1000:{
        items:4,
        nav:true,
        loop:false
      }
  	}
	});


 

	var contentWayPoint = function() {
		var i = 0;
		$('.element-animate').waypoint( function( direction ) {

			if( direction === 'down' && !$(this.element).hasClass('element-animated') ) {
				
				i++;

				$(this.element).addClass('item-animate');
				setTimeout(function(){

					$('body .element-animate.item-animate').each(function(k){
						var el = $(this);
						setTimeout( function () {
							var effect = el.data('animate-effect');
							if ( effect === 'fadeIn') {
								el.addClass('fadeIn element-animated');
							} else if ( effect === 'fadeInLeft') {
								el.addClass('fadeInLeft element-animated');
							} else if ( effect === 'fadeInRight') {
								el.addClass('fadeInRight element-animated');
							} else {
								el.addClass('fadeInUp element-animated');
							}
							el.removeClass('item-animate');
						},  k * 100);
					});
					
				}, 100);
				
			}

		} , { offset: '95%' } );
	};
	contentWayPoint();



})(jQuery);

const likeBtn = document.getElementById('likeBtn');
const unlikeBtn = document.getElementById('unlikeBtn');

likeBtn.addEventListener('click', function() {
  likeBtn.classList.add('d-none');
  unlikeBtn.classList.remove('d-none');
})

unlikeBtn.addEventListener('click', function() {
  likeBtn.classList.remove('d-none');
  unlikeBtn.classList.add('d-none');
})

// let heart = 'ti-heart';
// let heart_broken = 'ti-heart-broken';



$('#likeBtn').click(function() {
  let count = parseInt(document.getElementById('like-count').innerHTML);
  count++;
  document.getElementById('like-count').innerHTML = count;
  
  const username = $('.user').text().trim();
  $.ajax({
    url: window.location.pathname,
    method: 'POST',
    data: {
      signal: true,
      username
    },
    
    success: function(result) {
      
    }
  })
})

$('#unlikeBtn').click(function() {
  // event.preventDefault();

  let count = parseInt(document.getElementById('like-count').innerHTML);
  count--
  document.getElementById('like-count').innerHTML = count;
  
  const username = $('.user').text().trim();
  $.ajax({
    url: window.location.pathname,
    method: 'POST',
    data: {
      username
    },
    
    success: function(result) {
      
    }
  })
})

$('.edit-post').click(async function(e) {
  e.preventDefault();
  const old_content = await document.getElementById('post-content').innerHTML;
  $('#post-content').hide();
  document.getElementById('edit-post-box').value = old_content;
  $('#form-edit-post').removeClass('d-none').focus();
})

$('#confirm-edit-post').click(async function(e) {
  e.preventDefault();
  
  const new_content = await document.getElementById('edit-post-box').value;
  const urls = window.location.pathname.split('/');
  const id = urls[2];
  console.log(new_content);

  $('#form-edit-post').hide();
  document.getElementById('post-content').innerHTML = new_content;
  
  

  $.ajax({
    url: "/" + urls[1] + "/edit/" + urls[2],
    method: 'POST',
    data: {
      new_content: new_content,
      id: id // => req.body
    },
    
    success: function(result) {
      $('#post-content').show();
    }
  })
})

function normalizeDateAndTime(date) {
  var hourString = date.getHours();
	var minuteString = date.getMinutes();

	if (hourString < 10) {
		hourString = '0' + hourString;
	}

	if (minuteString < 10) {
		minuteString = '0' + minuteString;
	}


	var month = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'June', 'July', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
	return month[date.getMonth()] + ' ' + date.getDate() + ', ' + date.getFullYear() + ' At ' + hourString + ':' + minuteString;
}

$('#post-comment').click(function(e) {
  e.preventDefault();

  var username = document.getElementById('username-comment').innerHTML;
  var avatar = document.getElementById('avatar-comment').innerHTML;
  var comment = document.getElementById('message').value;
  var createdAt = normalizeDateAndTime(new Date());

  let html = document.createElement('li');
  console.log();
  html.className = 'comment';
  html.innerHTML = `<div class="vcard">
                        <img src="../uploads/${avatar}" alt="Image placeholder">
                      </div>
                      <div class="comment-body">
                        <h3>${username}</h3>
                        <div class="meta">${createdAt}</div>
                        <p>${comment}</p>
                      </div>`

  document.getElementById('comment-list').appendChild(html);
  document.getElementById('message').value = '';

  console.log(window.location.pathname);

  $.ajax({
    url: window.location.pathname + '/comments',
    method: 'POST',
    data: {
      username, avatar, comment, createdAt
    },
    success: function(result) {

    }
  })
})
