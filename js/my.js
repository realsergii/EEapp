$(function(){
    $datagrid = $('#dg');
    $addFields = $('#addFields');
    suppLocFields = {};
    suppLocFields_values = [];

    load_data('/api/location/getSupportedFields').done(function(data) {
        suppLocFields = data;
        data.date_modified = 'Date Modified';
        $.each(suppLocFields, function(key, value) {
            suppLocFields_values.push(value);
        })
    });

    $datagrid.datagrid({
        url:'/api/location/getAllLocations'
    });

    $('#addBtn').on("click", function(){ addNew() });
    $('#searchBtn').on("click", function(){ doSearch() });
    $('#resetSearchBtn').on("click", function(){ resetSearch() });

    $datagrid.datagrid({
        onSelect: function(rowIndex, rowData){
            showDetailsFor(rowIndex, rowData);
        },
        onLoadSuccess: function() {$addFields.css('display', 'none'); $datagrid.datagrid('unselectAll');}
    });
});

function addNew() {
    showDetailsFor(null, null);
}

function doSearch(){
    $datagrid.datagrid('load',{
        name: $('#nameSearch').val(),
        city: $('#citySearch').val()
    });
}

function resetSearch() {
    $('#nameSearch').val('');
    $('#citySearch').val('');
    doSearch();
}

function load_data (json_url) {
    return $.getJSON(json_url);
}

function getDisplayedInputs() {
    var res = [];
    $('.autoSizeInput[style!="display:none"]').each(function(index, element ) {
        res.push($(this).siblings($('span')).attr('name'));
    } );
    return res;
}

function addNewBlockThatMightBecomeAField() {
    //only fields that are not displayed currently could be added, so are present in <select>
    //if we can't add more fields, 'Add field' button will not be displayed
    //var addFieldsToDisplay = getFieldsToDisplay();
    var addFieldsToDisplay = [];
    $.each(getFieldsToDisplay(), function(key, value){
        if (value != 'Date Modified') { addFieldsToDisplay.push(value); }
    });
    if (addFieldsToDisplay.length == 0) {return true;}

    $("<span style='display: inline-block' id='addFieldWrapper'>").appendTo($addFields_form);
    var $addFieldWrapper = $('#addFieldWrapper');

    $('<a/>', {
        class: 'easyui-linkbutton l-btn l-btn-plain',
        id: 'add_field_btn',
        plain: 'true',
        iconcls: 'icon-add'
    }).appendTo($addFieldWrapper);

    $('<span/>', {
        class: 'l-btn-left',
        id: 'add_field_btn_wrap'
    }).appendTo($('#add_field_btn'));

    $('<span/>', {
        class: 'l-btn-text icon-add l-btn-icon-left',
        html: 'Add field'
    }).appendTo($('#add_field_btn_wrap'));

    $('#add_field_btn').on("click", function() {
        $(this).css('display', 'none');
        if (addFieldsToDisplay.length > 1) { $('#add_field_select').css('display', 'inline'); }
        else {
            var theOnlyFieldLower = addFieldsToDisplay[0].toLowerCase();
            $('#addFieldWrapper').attr('id', theOnlyFieldLower+'Wrapper');
            $("<span name='" + addFieldsToDisplay[0] + "' style='margin-left: 3px'> " +  addFieldsToDisplay[0]
                + ' ' + "</span>").prependTo($('#'+theOnlyFieldLower+'Wrapper'));
            $('#add_field_btn').remove();
            $('#add_field_select').remove();
            $('<input/>', {
                name: theOnlyFieldLower,
                type: 'text',
                class: 'autoSizeInput'
            }).appendTo($addFieldWrapper);
            $('.autoSizeInput').autosizeInput();
        }
    });

    $('<select/>', {
        id: 'add_field_select',
        style: 'display:none'
    }).appendTo($addFieldWrapper);
    $.each(addFieldsToDisplay, function(key, value) {
        if (value == 'Date Modified') {  return true; }
        $('#add_field_select').append($("<option></option>").attr("value",key).text(value));
    });
    $('#add_field_select').prepend($("<option></option>").attr("value",'nullValue').text('select field'));
    $('#add_field_select').on("change", function() {
        var selectedField = $('#add_field_select').find(':selected').text();
        $('#addFieldWrapper').attr('id', selectedField.toLowerCase()+'Wrapper');
        $("<span name='" + selectedField + "' style='margin-left: 3px'> " +  selectedField
            + ' ' + "</span>").prependTo($('#'+selectedField.toLowerCase()+'Wrapper'));
        $('#add_field_btn').remove();
        $('#add_field_select').remove();

        $('<input/>', {
            name: selectedField.toLowerCase(),
            type: 'text',
            class: 'autoSizeInput'
        }).appendTo($addFieldWrapper);
        $('.autoSizeInput').autosizeInput();

        if (getFieldsToDisplay().length > 0) {
            addNewBlockThatMightBecomeAField();
        }
    });
}

function showDetailsFor(rowIndex, rowData) {

    if (rowIndex == null && rowData == null) {
        addEmptyBlockWithFormForEditingOrAddingLocations('/api/location/addLocation');
        addWrapperWithSpanAndInputFor('id', '');
        addWrapperWithSpanAndInputFor('name', '');
        addWrapperWithSpanAndInputFor('lat', '');
        addWrapperWithSpanAndInputFor('lng', '');
    }
    else {
        addEmptyBlockWithFormForEditingOrAddingLocations('/api/location/editLocation');
        $.each(rowData, function(key, element) {
            if (element == null) {return true;}
            if (key == 'date_modified') {
                addWrapperWithSpanAndInputFor(key, element);
                $('input[name=date_modified]').prop('disabled', true);
                return true;
            }
            addWrapperWithSpanAndInputFor(key, element);
        });
    }
    $('#idWrapper').css('display', 'none');
    addNewBlockThatMightBecomeAField();
    addSaveButton();
    addDestroyButton();
    addWrapperForDateModified();
}

function addWrapperForDateModified() {
    $("<span style='display: inline-block; float:right' id='dateModifiedWrapper'>").appendTo($addFields_form);
    $('#date_modifiedWrapper').appendTo($('#dateModifiedWrapper'));
}

function addWrapperWithSpanAndInputFor(name, withValue) {
    $("<span style='display: inline-block' id=" + name + "Wrapper>").appendTo($addFields_form);

    $("<span name='" + suppLocFields[name] + "' style='margin-left: 3px'> " +  suppLocFields[name] + ' '
        + "</span>").appendTo($('#'+name+'Wrapper'));

    var final_value = name == 'date_modified' ? new Date(withValue).toLocaleString() : withValue;

    $('<input/>', {
        name: name,
        type: 'text',
        value: final_value,
        class: 'autoSizeInput'
    }).appendTo($('#'+name+'Wrapper'));
    $('.autoSizeInput').autosizeInput();
}

function addEmptyBlockWithFormForEditingOrAddingLocations(url) {
    $addFields.css('display', 'block');
    $addFields.html('');

    $('<form/>', {
        id:'addFields_form',
        method:'post'
    }).appendTo($addFields);
    $addFields_form = $('#addFields_form');

    $addFields_form.form({
        url: url,
        onSubmit: function(){
            // do some check
            // return false to prevent submit;
        },
        success:function(data){
            $datagrid.datagrid('reload');
        }
    });
}

function addDestroyButton() {
    $("<span style='display: inline-block; float:right' id='destroyBtnWrapper'>").appendTo($addFields_form);

    $('<a/>', {
        class: 'easyui-linkbutton l-btn l-btn-plain',
        id: 'destroy_btn',
        plain: 'true',
        iconcls: 'icon-remove'
    }).appendTo($('#destroyBtnWrapper'));

    $('<span/>', {
        class: 'l-btn-left',
        id: 'destroy_btn_wrap'
    }).appendTo($('#destroy_btn'));

    $('<span/>', {
        class: 'l-btn-text icon-remove l-btn-icon-left',
        html: 'Destroy'
    }).appendTo($('#destroy_btn_wrap'));

    $('#destroy_btn').on("click", function() { destroySelected() });
}

function addSaveButton() {
    $("<span style='display: inline-block; float:right' id='saveBtnWrapper'>").appendTo($addFields_form);

    $('<a/>', {
        class: 'easyui-linkbutton l-btn l-btn-plain',
        id: 'save_btn',
        plain: 'true',
        iconcls: 'icon-save'
    }).appendTo($('#saveBtnWrapper'));

    $('<span/>', {
        class: 'l-btn-left',
        id: 'save_btn_wrap'
    }).appendTo($('#save_btn'));

    $('<span/>', {
        class: 'l-btn-text icon-save l-btn-icon-left',
        html: 'Save'
    }).appendTo($('#save_btn_wrap'));

    $('#save_btn').on("click", function() { $('#addFields_form').submit() });
}

function destroySelected() {
    var row = $datagrid.datagrid('getSelected');
    if (row){
        $.messager.confirm('Confirm','Are you sure you want to destroy this location?',function(r){
            if (r){
                $.post('/api/location/deleteLocation',{id:row.id},function(result){
                    if (result.success){
                        $datagrid.datagrid('reload');
                    } else {
                        $.messager.show({    // show error message
                            title: 'Error',
                            msg: result.errorMsg
                        });
                    }
                },'json');
            }
        });
    }
}

function getFieldsToDisplay() {
    return $(suppLocFields_values).not(getDisplayedInputs());
}
