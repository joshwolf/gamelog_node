var parseName = function (name) {
    var salutations = ['mr', 'master', 'mister', 'mrs', 'miss', 'ms', 'dr', 'prof', 'rev', 'fr', 'judge', 'honorable', 'hon'];
    var suffixes = ['i', 'ii', 'iii', 'iv', 'v', 'senior', 'junior', 'jr', 'sr', 'phd', 'apr', 'rph', 'pe', 'md', 'ma', 'dmd', 'cme'];
    var compound = ['vere', 'von', 'van', 'de', 'del', 'della', 'der', 'di', 'da', 'pietro', 'vanden', 'du', 'st.', 'st', 'la', 'lo', 'ter', 'bin', 'ibn', 'te', 'ten', 'op', 'ben'];

    var parts = name.trim().split(/\s+/);
        var attrs = {};

    if (!parts.length) {
        return attrs;
    }

    if ( parts.length === 1 ) {
        attrs.firstName = parts[0];
    }

    //handle suffix first always, remove trailing comma if there is one
    if ( parts.length > 1 && _.indexOf(suffixes, _.last(parts).toLowerCase().replace(/\./g, '')) > -1) {
        attrs.suffix = parts.pop();
        parts[parts.length-1] = _.last(parts).replace(',', '');
    }

    //look for a comma to know we have last name first format
    var firstNameFirstFormat = _.every(parts, function(part) {
        return part.indexOf(',') === -1;
    })

    if (!firstNameFirstFormat) {
    //last name first format
    //assuming salutations are never used in this format

        //tracker variable for where first name begins in parts array
        var firstNameIndex;

        //location of first comma will separate last name from rest
        //join all parts leading to first comma as last name
        var lastName = _.reduce(parts, function (lastName, current, index) {
            if (!Array.isArray(lastName)) {
                return lastName;
            }
            if (current.indexOf(',') === -1) {
                lastName.push(current)
                return lastName;
            } else {
                current = current.replace(',', '');
                lastName.push(current);
                firstNameIndex = index + 1;
                return lastName.join(' ');
            }
        }, []);

        attrs.lastName = lastName;

        var remainingParts = parts.slice(firstNameIndex);
        if (remainingParts.length > 1) {
            attrs.firstName = remainingParts.shift();
            attrs.middleName = remainingParts.join(' ');
        } else if (remainingParts.length) {
            attrs.firstName = remainingParts[0];
        }

        //create full name from attrs object
        var nameWords = [];
        if (attrs.firstName) {
            nameWords.push(attrs.firstName);
        }
        if (attrs.middleName) {
            nameWords.push(attrs.middleName)
        }
        nameWords.push(attrs.lastName)
        if (attrs.suffix) {
            nameWords.push(attrs.suffix);
        }
        attrs.fullName = nameWords.join(' ');

        
    } else {
    //first name first format


        if ( parts.length > 1 && _.indexOf(salutations, _.first(parts).toLowerCase().replace(/\./g, '')) > -1) {
            attrs.salutation = parts.shift();
            attrs.firstName = parts.shift();
        } else {
            attrs.firstName = parts.shift();
        }

        attrs.lastName  = parts.length ? parts.pop() : '';

        // test for compound last name, we reverse because middle name is last bit to be defined.
        // We already know lastname, so check next word if its part of a compound last name.
        var revParts = parts.slice(0).reverse();
                var compoundParts = [];

        _.every(revParts, function(part, i, all){
            var test = part.toLowerCase().replace(/\./g, '');

            if (_.indexOf(compound, test) > -1 ) {
                compoundParts.push(part);

                return true;
            }

            //break on first non compound word
            return false;
        });

        //join compound parts with known last name
        if ( compoundParts.length ) {
            attrs.lastName = compoundParts.reverse().join(' ') + ' ' + attrs.lastName;

            parts = _.difference(parts, compoundParts);
        }

        if ( parts.length ) {
            attrs.middleName = parts.join(' ');
        }

        //remove comma like "<lastName>, Jr."
        if ( attrs.lastName ) {
            attrs.lastName = attrs.lastName.replace(',', '');
        }

        //save a copy of original
        attrs.fullName = name;

    }
    //console.log('attrs:', JSON.stringify(attrs));
    return attrs;
};
