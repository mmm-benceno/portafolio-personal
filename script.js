document.addEventListener('DOMContentLoaded', function() {
    const commentsForm = document.querySelector('#comments form');
    const commentsSection = document.querySelector('#comments');
    const COMMENTS_KEY = 'userComments';

    // Mostrar comentarios guardados
    function renderComments() {
        commentsSection.querySelectorAll('.comment-box').forEach(el => el.remove());
        const comments = JSON.parse(localStorage.getItem(COMMENTS_KEY) || '[]');
        comments.forEach((data, idx) => {
            const commentBox = document.createElement('div');
            commentBox.className = 'comment-box';
            commentBox.style.margin = "16px 0";
            commentBox.style.padding = "12px";
            commentBox.style.background = "#f8f7f4";
            commentBox.style.borderRadius = "10px";
            commentBox.style.boxShadow = "0 2px 8px rgba(163,201,226,0.10)";
            commentBox.innerHTML = `
                <strong>${data.name}:</strong><br>
                <span class="comment-text">${data.comment}</span>
                <div style="margin-top:8px;">
                    <button class="edit-btn" data-idx="${idx}" style="margin-right:8px;">Edit</button>
                    <button class="delete-btn" data-idx="${idx}" style="margin-right:8px;">Delete</button>
                    <button class="reply-btn" data-idx="${idx}">Reply</button>
                </div>
                <div class="replies"></div>
            `;
            commentsForm.parentNode.insertBefore(commentBox, commentsForm);

            // Mostrar respuestas si existen
            if (data.replies && Array.isArray(data.replies)) {
                const repliesDiv = commentBox.querySelector('.replies');
                data.replies.forEach((reply, rIdx) => {
                    const replyBox = document.createElement('div');
                    replyBox.className = 'reply-box';
                    replyBox.style.margin = "12px 0 0 24px";
                    replyBox.style.padding = "10px";
                    replyBox.style.background = "#e4d9c5";
                    replyBox.style.borderRadius = "8px";
                    replyBox.style.boxShadow = "0 1px 4px rgba(163,201,226,0.08)";
                    replyBox.innerHTML = `
                        <strong>${reply.name}:</strong> <span>${reply.comment}</span>
                        <div style="margin-top:8px;">
                            <button class="edit-reply-btn" data-idx="${idx}" data-ridx="${rIdx}" style="margin-right:8px;">Edit</button>
                            <button class="delete-reply-btn" data-idx="${idx}" data-ridx="${rIdx}">Delete</button>
                        </div>
                    `;
                    repliesDiv.appendChild(replyBox);
                });
            }
        });

        // Eliminar comentario principal
        commentsSection.querySelectorAll('.delete-btn').forEach(btn => {
            btn.onclick = function() {
                const idx = parseInt(this.getAttribute('data-idx'));
                const comments = JSON.parse(localStorage.getItem(COMMENTS_KEY) || '[]');
                comments.splice(idx, 1);
                localStorage.setItem(COMMENTS_KEY, JSON.stringify(comments));
                renderComments();
            };
        });

        // Editar comentario principal
        commentsSection.querySelectorAll('.edit-btn').forEach(btn => {
            btn.onclick = function() {
                const idx = parseInt(this.getAttribute('data-idx'));
                const comments = JSON.parse(localStorage.getItem(COMMENTS_KEY) || '[]');
                const commentData = comments[idx];
                commentsForm.querySelector('input[name="name"]').value = commentData.name;
                commentsForm.querySelector('textarea[name="comment"]').value = commentData.comment;
                comments.splice(idx, 1);
                localStorage.setItem(COMMENTS_KEY, JSON.stringify(comments));
                renderComments();
            };
        });

        // Eliminar respuesta
        commentsSection.querySelectorAll('.delete-reply-btn').forEach(btn => {
            btn.onclick = function() {
                const idx = parseInt(this.getAttribute('data-idx'));
                const ridx = parseInt(this.getAttribute('data-ridx'));
                const comments = JSON.parse(localStorage.getItem(COMMENTS_KEY) || '[]');
                if (comments[idx].replies) {
                    comments[idx].replies.splice(ridx, 1);
                    localStorage.setItem(COMMENTS_KEY, JSON.stringify(comments));
                    renderComments();
                }
            };
        });

        // Editar respuesta
        commentsSection.querySelectorAll('.edit-reply-btn').forEach(btn => {
            btn.onclick = function() {
                const idx = parseInt(this.getAttribute('data-idx'));
                const ridx = parseInt(this.getAttribute('data-ridx'));
                const comments = JSON.parse(localStorage.getItem(COMMENTS_KEY) || '[]');
                const replyData = comments[idx].replies[ridx];
                // Mostrar formulario de edición debajo de la respuesta
                const replyBox = btn.closest('.reply-box');
                let editForm = replyBox.querySelector('.edit-reply-form');
                if (editForm) return;
                editForm = document.createElement('form');
                editForm.className = 'edit-reply-form';
                editForm.innerHTML = `
                    <input type="text" name="name" value="${replyData.name}" required style="margin-bottom:6px;">
                    <textarea name="comment" required style="margin-bottom:6px;">${replyData.comment}</textarea>
                    <button type="submit">Save</button>
                `;
                editForm.style.marginTop = "10px";
                editForm.style.display = "flex";
                editForm.style.flexDirection = "column";
                editForm.style.gap = "6px";
                replyBox.appendChild(editForm);

                editForm.addEventListener('submit', function(e) {
                    e.preventDefault();
                    const newName = editForm.querySelector('input[name="name"]').value.trim();
                    const newComment = editForm.querySelector('textarea[name="comment"]').value.trim();
                    if (newName && newComment) {
                        comments[idx].replies[ridx] = { name: newName, comment: newComment };
                        localStorage.setItem(COMMENTS_KEY, JSON.stringify(comments));
                        renderComments();
                    } else {
                        alert("Please enter your name and reply.");
                    }
                });
            };
        });

        // Responder comentario principal
        commentsSection.querySelectorAll('.reply-btn').forEach(btn => {
            btn.onclick = function() {
                const idx = parseInt(this.getAttribute('data-idx'));
                const commentBox = this.closest('.comment-box');
                let replyForm = commentBox.querySelector('.reply-form');
                if (replyForm) return; // Ya existe el formulario

                replyForm = document.createElement('form');
                replyForm.className = 'reply-form';
                replyForm.innerHTML = `
                    <input type="text" name="name" placeholder="Your name" required style="margin-bottom:6px;">
                    <textarea name="comment" placeholder="Your reply" required style="margin-bottom:6px;"></textarea>
                    <button type="submit">Send Reply</button>
                `;
                replyForm.style.marginTop = "10px";
                replyForm.style.display = "flex";
                replyForm.style.flexDirection = "column";
                replyForm.style.gap = "6px";

                commentBox.appendChild(replyForm);

                replyForm.addEventListener('submit', function(e) {
                    e.preventDefault();
                    const replyName = replyForm.querySelector('input[name="name"]').value.trim();
                    const replyComment = replyForm.querySelector('textarea[name="comment"]').value.trim();
                    if (replyName && replyComment) {
                        const comments = JSON.parse(localStorage.getItem(COMMENTS_KEY) || '[]');
                        if (!comments[idx].replies) comments[idx].replies = [];
                        comments[idx].replies.push({ name: replyName, comment: replyComment });
                        localStorage.setItem(COMMENTS_KEY, JSON.stringify(comments));
                        renderComments();
                    } else {
                        alert("Please enter your name and reply.");
                    }
                });
            };
        });
    }

    renderComments();

    if (commentsForm) {
        commentsForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const name = this.querySelector('input[name="name"]').value.trim();
            const comment = this.querySelector('textarea[name="comment"]').value.trim();
            if (name && comment) {
                const comments = JSON.parse(localStorage.getItem(COMMENTS_KEY) || '[]');
                comments.push({ name, comment }); // Los nuevos comentarios van abajo
                localStorage.setItem(COMMENTS_KEY, JSON.stringify(comments));
                renderComments();
                this.reset();
            } else {
                alert("Please enter your name and comment.");
            }
        });
    }

   // Contact form funcionalidad
    const contactForm = document.querySelector('#contact form');
    if (contactForm) {
        contactForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const name = this.querySelector('input[name="name"]').value.trim();
            const email = this.querySelector('input[name="email"]').value.trim();
            const message = this.querySelector('textarea[name="message"]').value.trim();
            if (name && email && message) {
                alert("Thank you for contacting me, " + name + "!");
                this.reset();
            } else {
                alert("Please fill in all fields.");
            }
        });
    }
});