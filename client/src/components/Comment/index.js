import React, { useState, useEffect, useContext } from "react";
import "./style.css";
import ContentEditable from "react-contenteditable";
import SocketContext from "../../utils/SocketContext";
import API from "../../utils/API";

export function Comment(props) {
  const socket = useContext(SocketContext);

  // State to track the comment text
  const [commentTextContent, setCommentTextContent] = useState(props.commentText);

  useEffect(() => {
    // When another user changes a comment's text, listen here to update the text on current user's DOM
    socket.on("incoming-comment-text-change", data => {
      // If that comment is this current comment, change the comment it
      if (data.commentId === props.commentId) {
      setCommentTextContent(data.stickyTextContent)
      }
    })

    return () => {
      socket.off("incoming-comment-text-change")
    }
  }, [])

  // After finishing changing a sticky's text
  const handleFinishCommentChange = e => {
    // If the text hasn't changed, do nothing
    if (commentTextContent === e.target.innerHTML) {
      return
    }

    setCommentTextContent(e.target.innerHTML);

    // Send new text to server to broadcast to all other users
    socket.emit("comment-text-change", {commentId: props.commentId, stickyId: props.stickyId, stickyTextContent: e.target.innerHTML});

    // Save new text in database
    API.changeCommentText({commentId: props.commentId, commentTextContent: e.target.innerHTML})
      .then(data => console.log("comment's new text saved in database! ", data))
      .catch(err => console.log(err))
  }

  return (
    <ContentEditable
      html={commentTextContent}
      disabled={false}
      className="comment"
      onBlur={handleFinishCommentChange}
    />
  );
}

export default Comment;