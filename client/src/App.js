import "./App.css";
import { Button, Form, Row, Col } from "react-bootstrap";
import { useState, useEffect } from "react";
import instance from "./axios.js";

function App() {
  const initialFormData = Object.freeze({
    title: "",
    amount: 1,
    reason: "",
  });

  const [reload, setReload] = useState(false);
  const [editItem, setEditItem] = useState("");
  const [updating, setUpdating] = useState(false);
  const [formData, updateFormData] = useState(initialFormData);
  const [selected, setSelected] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [readItems, setReadItems] = useState([]);
  const [deleting, setDeleting] = useState(false);
  const [deleteItem, setDeleteItem] = useState("");
  const [restoreItems, setRestoreItems] = useState([]);

  const ItemRow = ({ item }) => {
    const handleEditClick = (e) => {
      console.log("editting");
      console.log(item);
      setUpdating(true);
      setEditItem(item);
    };
    const handleDeleteClick = async (e) => {
      e.preventDefault();
      console.log("deleting");
      console.log(item);
      setDeleting(true);
      setDeleteItem(item);
    };

    return (
      <tr>
        <td>{item?.title}</td>
        <td>{item?.amount}</td>
        <td>
          <Button onClick={handleEditClick}>Edit</Button>
        </td>
        <td>
          <Button onClick={handleDeleteClick}>Delete</Button>
        </td>
      </tr>
    );
  };

  const RestoreRow = ({ item }) => {
    const handleRestoreItem = async (e) => {
      e.preventDefault();
      console.log("restoring");
      console.log(item);
      setDeleting(true);
      setDeleteItem(item);
      instance
        .post("restore-item", item)
        .then((res) => {
          console.log(res);
          setReload(!reload);
          setSuccess(`${item.title} restored`);
        })
        .catch((err) => {
          console.log(err);
        });
    };
    const handleObliterateItem = async (e) => {
      e.preventDefault();
      console.log("restoring");
      console.log(item);
      instance
        .post("obliterate-item", item)
        .then((res) => {
          console.log(res);
          setReload(!reload);
          setSuccess(`${item.title} has been obliterated`);
        })
        .catch((err) => {
          console.log(err);
        });
    };
    return (
      <tr>
        <td>{item?.title}</td>
        <td>{item?.reason}</td>
        <td>
          <Button onClick={handleRestoreItem}>Restore</Button>
        </td>
        <td>
          <Button onClick={handleObliterateItem}>Obliterate</Button>
        </td>
      </tr>
    );
  };

  useEffect(() => {
    if (selected === "read") {
      instance.get("/read-items").then((res) => {
        setReadItems(res.data);
      });
    }
    if (selected === "restore") {
      instance.get("/restore-items").then((res) => {
        setRestoreItems(res.data);
      });
    }
  }, [selected, reload]);

  const handleChange = (e) => {
    updateFormData({
      ...formData,
      [e.target.name]: e.target.value.trim(),
    });
  };

  const handleAddClick = (e) => {
    setSelected("add");
  };
  const handleReadClick = (e) => {
    setSelected("read");
  };
  const handleRestoreClick = (e) => {
    setSelected("restore");
  };
  const handleBackClick = (e) => {
    setSelected("");
    setError("");
    setSuccess("");
    setDeleteItem("");
    setEditItem("");
    setDeleting(false);
    setUpdating(false);
  };
  const handleDeleteSubmit = (e) => {
    e.preventDefault();
    console.log("Item being deleted");
    console.log(formData);
    console.log(deleteItem);

    instance
      .post("/delete-item", { _id: deleteItem._id, reason: formData.reason })
      // .delete(`/delete-item/${deleteItem._id}/${formData.reason}`)
      .then((res) => {
        console.log(res);
        setDeleting(false);
        setDeleteItem("");
        setReload(!reload);
        setSuccess(`${deleteItem.title} deleted`);
      })
      .catch((err) => {
        console.log(err);
      });
  };
  const itemList = readItems.map((item, i) => {
    return <ItemRow key={i} item={item} />;
  });

  const RestoreList = restoreItems.map((item, i) => {
    return <RestoreRow key={i} item={item} />;
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("submit");
    if (formData.amount < 1) {
      setError("Amount must be greater than 0");
    } else if (!formData.title || formData.title === "") {
      setError("Title cannot be empty");
    } else {
      instance
        .post("/create-item", formData)
        .then((res) => {
          console.log(res);
          setSuccess(`${res.data.title} added successfully`);
          setError("");
        })
        .catch((err) => {
          console.log(err);
          setError(err.response.data.error);
        });
    }
  };

  const handleUpdate = (e) => {
    e.preventDefault();
    console.log("update");
    if (formData.amount < 1) {
      setError("Amount must be greater than 0");
    }
    console.log(editItem);
    formData.title = editItem._id;
    instance
      .put("/update-item", formData)
      .then((res) => {
        console.log(res.data);
        setSuccess(`${editItem.title} updated successfully`);
        setError("");
        setUpdating(false);
        setEditItem("");
        setReload(!reload);
      })
      .catch((err) => {
        console.log(err);
        // setError(err.response.data.error);
      });
    formData.title = "";
  };

  return (
    <div className="App">
      <header className="App-header">
        {selected && <Button onClick={handleBackClick}>Go Back</Button>}
        {success && <p>{success}</p>}
        {selected === "" ? (
          <div>
            <Button onClick={handleAddClick}>Add New Item</Button>
            <Button onClick={handleReadClick}>List of Active Items</Button>
            <Button onClick={handleRestoreClick}>List of Deleted Items</Button>
          </div>
        ) : selected === "add" ? (
          <Form>
            <Form.Group controlId="formBasicEmail">
              <Form.Label>Item Title: </Form.Label>
              <Form.Control
                name="title"
                required
                type="text"
                placeholder="Enter Item Title"
                onChange={handleChange}
              />
            </Form.Group>
            <Form.Group controlId="formBasicPassword">
              <Form.Label>Item Amount: </Form.Label>
              <Form.Control
                name="amount"
                type="number"
                min="1"
                required
                placeholder="Enter Item Amount"
                onChange={handleChange}
              />
            </Form.Group>
            <Button variant="primary" type="submit" onClick={handleSubmit}>
              Submit
            </Button>
          </Form>
        ) : selected === "read" ? (
          <div>
            <table cellPadding="0" cellSpacing="0">
              <thead className="tbl-header">
                <tr>
                  <th>Item Title</th>
                  <th>Amount</th>
                </tr>
              </thead>
              <tbody className="tbl-content">{itemList}</tbody>
            </table>
            {deleting ? (
              <Form>
                <Form.Group controlId="formBasicEmail">
                  <Form.Label>Item Title: {deleteItem.title}</Form.Label>
                </Form.Group>
                <Form.Group controlId="formBasicPassword">
                  <Form.Label>Reason for deletion: </Form.Label>
                  <Form.Control
                    name="reason"
                    type="text"
                    required
                    placeholder=""
                    onChange={handleChange}
                  />
                </Form.Group>
                <Button
                  variant="primary"
                  type="submit"
                  onClick={handleDeleteSubmit}
                >
                  Delete Item
                </Button>
              </Form>
            ) : null}
          </div>
        ) : selected === "restore" ? (
          <table cellPadding="0" cellSpacing="0">
            <thead className="tbl-header">
              <tr>
                <th>Item Title</th>
                <th>Reason for Deletion</th>
              </tr>
            </thead>
            <tbody className="tbl-content">{RestoreList}</tbody>
          </table>
        ) : null}
        {error !== "" && <p id="err-msg">Error: {error}</p>}
        {updating ? (
          <Form>
            <Form.Group controlId="formBasicEmail">
              <Form.Label>Item Title: {editItem.title} </Form.Label>
            </Form.Group>
            <Form.Group controlId="formBasicPassword">
              <Form.Label>Item Amount: </Form.Label>
              <Form.Control
                name="amount"
                type="number"
                min="1"
                required
                placeholder="Enter Item Amount"
                onChange={handleChange}
              />
            </Form.Group>
            <Button variant="primary" type="submit" onClick={handleUpdate}>
              Submit
            </Button>
          </Form>
        ) : null}
      </header>
    </div>
  );
}

export default App;
