const CreatePost = () => {
  return (
    <div className="bd-example-snippet bd-code-snippet">
      <div className="bd-example m-0 border-0">
        <form>
          <fieldset disabled="">
            <legend>Disabled fieldset example</legend>
            <div className="mb-3">
              <label htmlFor="disabledTextInput" className="form-label">Disabled input</label>
              <input type="text" id="disabledTextInput" className="form-control" placeholder="Disabled input" />
            </div>
            <div className="mb-3">
              <label htmlFor="disabledSelect" className="form-label">Disabled select menu</label>
              <select id="disabledSelect" className="form-select">
                <option>Disabled select</option>
              </select>
            </div>
            <div className="mb-3">
              <div className="form-check">
                <input className="form-check-input" type="checkbox" id="disabledFieldsetCheck" disabled="" />
                <label className="form-check-label" htmlFor="disabledFieldsetCheck">
                  Can’t check this
                </label>
              </div>
            </div>
            <button type="submit" className="btn btn-primary">Submit</button>
          </fieldset>
        </form>
      </div>
    </div>
  );

};
export default CreatePost;