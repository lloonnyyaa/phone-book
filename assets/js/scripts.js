let $apiUrl = document.location.href + "api/";
let $xhr = new XMLHttpRequest();
let $answer;

let $answerWrapper = document.getElementById('answer-wrapper-all');
let $answerWrapperSingle = document.getElementById('answer-wrapper-single');

let $buttonGetAll = document.getElementById('get-all-contacts');
let $buttonGetSingle = document.getElementById('get-single-contact');
let $buttonAddNumber = document.getElementById('add-phone-number');

let $formNewContact = document.getElementById("new-contact-form");

$formNewContact.addEventListener("submit", function (event) {
    event.preventDefault();
    sendForm(this);
});

$buttonGetAll.onclick = function () {
    $answerWrapper.innerHTML = '';

    $xhr.open("GET", $apiUrl + "users", true);
    $xhr.send();

    $xhr.onreadystatechange = function () {
        if ($xhr.readyState != 4)
            return;

        if ($xhr.status != 200) {
            alert($xhr.status + ': ' + $xhr.responseText);
        } else {
            $answer = JSON.parse($xhr.responseText);

            for (let value of $answer) {
                let $divNode = document.createElement("div");
                $divNode.classList.add("border");
                $divNode.classList.add("p-2");
                let $pNode = document.createElement("p");
                $pNode.classList.add("font-weight-bold");
                let $ulNode = document.createElement("ul");

                let $linkNode = document.createElement("a");
                $linkNode.classList.add("btn");
                $linkNode.classList.add("btn-danger");
                $linkNode.setAttribute("href", $apiUrl + "users/" + value.id);
                $linkNode.appendChild(document.createTextNode('Delete this contact'));

                $pNode.appendChild(document.createTextNode(value.name));
                $divNode.appendChild($pNode);
                $divNode.appendChild(document.createTextNode('Phones:'));

                for (let value2 of value.phones) {
                    let $liNode = document.createElement("li");
                    $liNode.appendChild(document.createTextNode(value2.number));
                    $ulNode.appendChild($liNode);
                }

                $divNode.appendChild($ulNode);
                $divNode.appendChild($linkNode);

                $answerWrapper.appendChild($divNode);

                $linkNode.addEventListener("click", function (event) {
                    event.preventDefault();
                    deleteContact(this);
                });
            }
        }
    };
};

$buttonGetSingle.onclick = function () {
    $answerWrapperSingle.innerHTML = '';

    let $userName = document.getElementById('name-single').value;

    if (!$userName) {
        alert('fill name');
        return false;
    }

    $xhr.open("GET", $apiUrl + "users/" + $userName, true);
    $xhr.send();

    $xhr.onreadystatechange = function () {
        if ($xhr.readyState != 4)
            return;

        if ($xhr.status != 200) {
            alert($xhr.status + ': ' + $xhr.responseText);
        } else {
            $answer = JSON.parse($xhr.responseText);

            let $formNode = document.createElement("form");
            $formNode.classList.add("p-2");
            $formNode.setAttribute("id", "edit-contact-form");
            let $submitNode = document.createElement("button");
            $submitNode.classList.add("btn");
            $submitNode.classList.add("btn-success");
            $submitNode.setAttribute("type", "submit");
            $submitNode.setAttribute("id", "edit-button");
            $submitNode.appendChild(document.createTextNode('Edit'));
            let $inputWrapper = document.createElement("div");
            $inputWrapper.classList.add("form-group");
            let $nameInputNode = document.createElement("input");
            $nameInputNode.classList.add("form-control");
            $nameInputNode.setAttribute("type", "text");
            $nameInputNode.setAttribute("name", "name");
            $nameInputNode.value = $answer.name;
            let $idInputNode = document.createElement("input");
            $idInputNode.setAttribute("type", "hidden");
            $idInputNode.setAttribute("name", "id");
            $idInputNode.value = $answer.id;
            let $addNode = document.createElement("button");
            $addNode.classList.add("btn");
            $addNode.classList.add("btn-secondary");
            $addNode.appendChild(document.createTextNode('add number'));

            $inputWrapper.appendChild($nameInputNode);
            $formNode.appendChild($inputWrapper);
            $formNode.appendChild(document.createTextNode('Phones: '));
            $formNode.appendChild($addNode);

            let $i = 0;
            for (let value of $answer.phones) {
                let $numberInputNode = document.createElement("input");
                $numberInputNode.classList.add("form-control");
                $numberInputNode.setAttribute("type", "text");
                $numberInputNode.setAttribute("name", "phones[" + value.id + "][number]");
                $numberInputNode.value = value.number;

                let $deleteNode = document.createElement("a");
                $deleteNode.setAttribute("href", "#");
                $deleteNode.classList.add("remove-number");
                $deleteNode.appendChild(document.createTextNode('delete number'));

                let $inputWrapper = document.createElement("div");
                $inputWrapper.classList.add("form-group");

                $inputWrapper.appendChild($numberInputNode);
                $inputWrapper.appendChild($deleteNode);
                $formNode.appendChild($inputWrapper);

                $i++;

                $deleteNode.addEventListener("click", function (event) {
                    event.preventDefault();
                    deleteNumber(this);
                });
            }

            $formNode.appendChild($idInputNode);
            $formNode.appendChild($submitNode);

            $answerWrapperSingle.appendChild($formNode);

            $formNode.addEventListener("submit", function (event) {
                event.preventDefault();
                sendEditForm(this);
            });
            $addNode.addEventListener("click", function (event) {
                event.preventDefault();
                addNumber(this);
            });
        }
    };
}

$buttonAddNumber.onclick = function () {
    let $phoneInputs = document.getElementsByClassName('clone');
    let $cloned = $phoneInputs[0].cloneNode(true);
    document.getElementById('phone-numbers-wrapper').appendChild($cloned);
};

sendForm = function ($form) {
    let $data = new FormData($form);
    let $contactObj = {}, $phonesArr = [], $m;

    for (let [key, value] of $data.entries()) {
        let $phoneObj = {};
        $m = key.match(/\[]\[(\w+)\]/);
        if ($m) {
            $phoneObj[$m[1]] = value;
            $phonesArr.push($phoneObj);
        } else {
            $contactObj[key] = value;
        }
    }

    $contactObj['phones'] = $phonesArr;

    $xhr.open("POST", $apiUrl + "users", true);
    $xhr.setRequestHeader('Content-Type', 'application/json');
    $xhr.send(JSON.stringify($contactObj));


    $xhr.onreadystatechange = function () {
        if ($xhr.readyState != 4)
            return;

        if ($xhr.status != 201) {
            alert($xhr.status + ': ' + $xhr.responseText);
        } else {
            $answer = JSON.parse($xhr.responseText);
            $form.reset();

            alert($answer.message);
        }
    };
};

sendEditForm = function ($form) {
    let $data = new FormData($form);
    let $contactObj = {}, $phonesArr = [], $m, $m2;

    for (let [key, value] of $data.entries()) {
        let $phoneObj = {};
        $m = key.match(/\[(\d+)]\[(\w+)\]/);
        $m2 = key.match(/\[]\[(\w+)\]/);

        if ($m) {
            $phoneObj['id'] = $m[1];
            $phoneObj['number'] = value;
            $phonesArr.push($phoneObj);
        } else if ($m2) {
            $phoneObj[$m2[1]] = value;
            $phonesArr.push($phoneObj);
        } else {
            $contactObj[key] = value;
        }
    }

    $contactObj['phones'] = $phonesArr;

    $xhr.open("PUT", $apiUrl + "users/" + $contactObj.id, true);
    $xhr.setRequestHeader('Content-Type', 'application/json');
    $xhr.send(JSON.stringify($contactObj));

    $xhr.onreadystatechange = function () {
        if ($xhr.readyState != 4)
            return;

        if ($xhr.status != 201) {
            alert($xhr.status + ': ' + $xhr.responseText);
        } else {
            $answer = JSON.parse($xhr.responseText);
            $form.reset();
            $answerWrapperSingle.innerHTML = '';
            alert($answer.message);
        }
    };
};

deleteContact = function ($link) {
    $xhr.open("DELETE", $link.href, true);
    $xhr.send();

    $xhr.onreadystatechange = function () {
        if ($xhr.readyState != 4)
            return;

        if ($xhr.status != 200) {
            alert($xhr.status + ': ' + $xhr.responseText);
        } else {
            $answer = JSON.parse($xhr.responseText);            
            $link.parentNode.remove();
            alert($answer.message);
        }
    };
}

deleteNumber = function ($link) {
    $link.parentNode.remove();
}

addNumber = function ($link) {
    let $form = $link.parentNode;

    let $numberInputNode = document.createElement("input");
    $numberInputNode.classList.add("form-control");
    $numberInputNode.setAttribute("type", "text");
    $numberInputNode.setAttribute("name", "phones[][number]");

    let $inputWrapper = document.createElement("div");
    $inputWrapper.classList.add("form-group");

    $inputWrapper.appendChild($numberInputNode);
    $form.insertBefore($inputWrapper, document.getElementById('edit-button'));

    return false;

}