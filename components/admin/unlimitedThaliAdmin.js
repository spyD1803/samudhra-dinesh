import React from "react";
import styled from "styled-components";

import { Editor } from "react-draft-wysiwyg";
import { EditorState, convertToRaw, ContentState } from "draft-js";
import "react-draft-wysiwyg/dist/react-draft-wysiwyg.css";
import draftToHtml from "draftjs-to-html";
import htmlToDraft from "html-to-draftjs";

import Text from "../common/Text";
import { firestore, storage } from "../firebase";

const Container = styled.div`
  background-color: #fff;
  padding: 16px;
`;

const Button = styled.div`
  display: flex;
  border: 2px solid #00c48a;
  border-radius: 6px;
  width: 150px;
  height: 48px;
  justify-content: center;
  align-items: center;
  cursor: pointer;
  margin-bottom: 16px;
  margin-top: 16px;
`;

const Buttontext = styled.div`
  font-family: Sans-Narrow-Bold;
  font-size: 16px;
  color: #00c48a;
`;

export default class UnlimitedThaliAdmin extends React.Component {
  state = {
    days: "",
    timings: "",
    content: EditorState.createEmpty(),
    error: ""
  };

  componentDidMount() {
    firestore
      .collection("unlimitedThali")
      .doc("unlimitedThali")
      .get()
      .then(thaliDetails => {
        const thaliDetailsData = thaliDetails.data();
        const thaliDetailsContent = thaliDetailsData.content;
        const blocksFromHtml = htmlToDraft(thaliDetailsContent);
        const { contentBlocks, entityMap } = blocksFromHtml;
        const contentState = ContentState.createFromBlockArray(
          contentBlocks,
          entityMap
        );
        const content = EditorState.createWithContent(contentState);
        // console.log("content", content);
        this.setState({
          ...thaliDetails.data(),
          content
        });
        // thaliDetails.data();
        // this.setState({
        //   ...thaliDetails.data()
        // });
      });
  }

  updateState = event => {
    this.setState({
      [event.target.name]: event.target.value,
      error: ""
    });
  };

  onSubmitClick = async event => {
    event.preventDefault();
    const { days, timings, content } = this.state;

    const contentData = draftToHtml(convertToRaw(content.getCurrentContent()));

    if (contentData.length > 0 && days.length > 0 && timings.length > 0) {
      firestore
        .collection("unlimitedThali")
        .doc("unlimitedThali")
        .update({
          days,
          timings,
          content: contentData
        });
    } else {
      this.setState({
        error: "fileds cannot be empty"
      });
    }
    // this.setState({
    //   title: "",
    //   description: "",
    //   imageUrl: ""
    // });

    this.setState({
      days: "",
      timings: "",
      content: EditorState.createEmpty()
    });
  };

  onEditorStateChange = editorState => {
    this.setState({
      content: editorState
    });
  };

  render() {
    const { content } = this.state;

    return (
      <>
        {this.state.error.length > 0 && (
          <p style={{ color: "red" }}>{`* ${this.state.error}`}</p>
        )}

        <div style={{ margin: "16px auto" }}>
          <label>Days:</label>
          <br />
          <input
            type="text"
            name="days"
            style={{
              width: "80%",
              padding: 16,
              marginTop: 8,
              border: "1px solid #000"
            }}
            value={this.state.days}
            onChange={this.updateState}
          />
        </div>

        <div style={{ margin: "16px auto" }}>
          <label>Timings:</label>
          <br />
          <input
            type="text"
            name="timings"
            style={{
              width: "80%",
              padding: 16,
              marginTop: 8,
              border: "1px solid #000"
            }}
            value={this.state.timings}
            onChange={this.updateState}
          />
        </div>

        <div className="demo-editor-wrapper">
          <Editor
            wrapperClassName="demo-wrapper"
            editorClassName="demo-editor"
            // toolbar={{
            //   colorPicker: { component: ColorPic }
            // }}
            editorStyle={{
              height: 200,
              border: "1px solid #eee",
              padding: 4
            }}
            onEditorStateChange={this.onEditorStateChange}
            editorState={content}
          />
        </div>

        <Button onClick={this.onSubmitClick}>
          <Buttontext>Submit</Buttontext>
        </Button>
      </>
    );
  }
}
