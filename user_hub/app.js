const BASE_URL = 'https://jsonplace-univclone.herokuapp.com';

//FETCH USER DATA ==== Used in multiple functions
function fetchData(url) {
    return fetch(url)
    .then(function(response) {
        return response.json();
    }).catch(function(error) {
        console.error(error);
    });
}

function fetchUsers() {
    return fetchData(`${ BASE_URL }/users`);
};

function loadPosts(userId) {
    return fetchData(`${BASE_URL}/users/${userId}/posts`);
}
  
function renderUser(user) {
    const userElement = $(`
    <div class="user-card">
        <header>
        <h2>${user.name}</h2>
        </header>
        <section class="company-info">
        <p><b>Contact:</b>${user.email}</p>
        <p><b>Works for:</b>${user.company.name}</p>
        <p><b>Company creed:</b>${user.company.catchPhrase}</p>
        </section>
        <footer>
        <button class="load-posts">POST BY ${user.username}</button>
        <button class="load-albums">ALBUM BY${user.username}</button>
        </footer>
    </div>`).data('user', user);
    
    return userElement;
}

function renderUserList(userList) {
    $('#user-list').empty();
    userList.forEach(function (user) {
        const userElement = renderUser(user);
        $('#user-list').append(userElement)
    })
}

// Takes a post object and returns HTML for a post
function renderPost(post) {
    return $(`
        <div class="post-card">
            <p>${post.body}</p>
            <footer>
                <div class="comment-list"></div>
                <a href="#" class="toggle-comments">(<span class="verb">show</span> comments)</a>
            </footer>
        </div>
    `).data('post', post);
}

function renderUserPosts(postList) {
    console.log('user posts', postList);
    postList.forEach(function (post) {
        const userPost = renderPost(post);
        $('#post-list').append(userPost);
    })
}

function bootstrap() {
    fetchUsers().then(renderUserList); 
}

function fetchUserAlbumList(userId) {
    return fetchData(`${ BASE_URL }/users/${userId}/albums?_expand=user&_embed=photos`);
}

fetchUserAlbumList(1).then(function (albumList) {
    console.log(albumList);
});

function renderAlbum(album) {
    var photoDomElements = '';
    var albumPhotos = album.photos.forEach(function (photo) {
        var photoDomElement = `
        <div class="photo-card">
            <img alt=${photo.title} src="${photo.thumbnailUrl}" />
        </div>
        `;
        photoDomElements = photoDomElements + photoDomElement;
    });

    const albumElement = $(`
    <div class="album-card">
    <header>
      <h3>quidem molestiae enim, by ${album.id} </h3>
    </header>
    <section class="photo-list">
        ${photoDomElements}
    </section>
    </div>
    `)
    return albumElement;
}

function renderAlbumList(albumList) {
    $('#album-list').empty();
    $('#app section.active').removeClass('active');
    $('#album-list').addClass('active');
    albumList.forEach(function(album) {
        const albumElement = renderAlbum(album);
        $('#album-list').append(albumElement);
    })
}


$('#user-list').on('click', '.user-card .load-posts', function () {
    const user = $(this).closest('.user-card').data('user');
    $('#app section.active').removeClass('active');
    $('#post-list').addClass('active');
    loadPosts(user.id).then(renderUserPosts);

    console.log(user)

});

// Add on click for user show post comments button
// Get the post that was clicked
// in the handler, we need to call the fetchPostComments(post)
// However, posts may not have comments, thus we need to render
// just a post comments box.
// if post.comments == undefined
//   Just show the post comment
// if post.comments is an array
//   loop through comments and render the comments as a <p></p>
// Then append the comments that we got, and render the post
// comments for the post.

$('#post-list').on('click', '.post-card .toggle-comments', function () {
    const post = $(this).closest('.post-card').data('post');
    console.log('post', post, 'comments', post.comments);

    setCommentsOnPost(post).then(post => {
        // Now render the comments
        var commentElement = $(this).closest('.post-card').find('.comment-list');
        post.comments.forEach(comment => {
            commentElement.append($(`<p>${comment.body}</p>`));
        });
    })
})
  
$('#user-list').on('click', '.user-card .load-albums', function () {
    const user = $(this).closest('.user-card').data('user');
    fetchUserAlbumList(user.id).then(renderAlbumList);

    console.log(user);
});

bootstrap();

fetchUsers().then(function (data) {
    renderUserList(data);
});

function fetchUserPosts(userId) {
    return fetchData(`${ BASE_URL }/users/${ userId }/posts?_expand=user`);
}
  
function fetchPostComments(postId) {
    return fetchData(`${ BASE_URL }/posts/${ postId }/comments`);
}

fetchUserPosts(1).then(console.log);   

fetchPostComments(1).then(console.log); 

function setCommentsOnPost(post) {
    if (post.comments) {
        console.log('we already have comments, not fetching them');
    }

    return fetchPostComments(post.id).then((comments) => {
        post.comments = comments;
        return post;
    });
}

setCommentsOnPost( somePost )
.then(function(post) {
})
.catch(function(error) {
});
