-- Helper function to get a value from a nested table using a dot-separated path
function get_nested_value(record, path)
    local current = record
    for key in string.gmatch(path, "[^.]+") do
        if current[key] then
            current = current[key]
        else
            return nil  -- Return nil if any part of the path is missing
        end
    end
    return current
end

-- Main function to extract fields based on the mapping
function extract_nested(tag, timestamp, record)
    -- Define mapping: target_field -> source_path
    local field_mappings = {
        trace_id = "metadata.trace.traceId",
        span_id = "metadata.trace.spanId",
        trace_service = "metadata.trace.service",
        event_id = "metadata.event.id",
        event_type = "metadata.event.type",
        event_action = "metadata.event.action",
        event_status = "metadata.event.state.status",
  
        source = "metadata.trace.tags.source",
        destination = "metadata.trace.tags.destination",
        transaction_type = "metadata.trace.tags.transactionType",
        transaction_action = "metadata.trace.tags.transactionAction",
  
        audit_type = "metadata.trace.tags.auditType",
        content_type = "metadata.trace.tags.contentType",
        service_name = "metadata.trace.tags.serviceName",
        operation = "metadata.trace.tags.operation",
        http_method = "metadata.trace.tags.httpMethod",
        http_path = "metadata.trace.tags.httpPath",
        http_query = "metadata.trace.tags.httpQuery",
        http_url = "metadata.trace.tags.httpUrl",
        party_id_type = "metadata.trace.tags.partyIdType",
        party_identifier = "metadata.trace.tags.partyIdentifier",
        party_sub_id_or_type = "metadata.trace.tags.partySubIdOrType",
        request_id = "metadata.trace.tags.requestId",
        oracle_id = "metadata.trace.tags.oracleId",
  
        quote_id = "metadata.trace.tags.quoteId",
        transaction_id = "metadata.trace.tags.transactionId",
        conversion_request_id = "metadata.trace.tags.conversionRequestId",
        conversion_id = "metadata.trace.tags.conversionId",
        determining_transfer_id = "metadata.trace.tags.determiningTransferId",
        transfer_id = "metadata.trace.tags.transferId",
        commit_request_id = "metadata.trace.tags.commitRequestId"
    }

    -- Extract fields dynamically
    for target_field, source_path in pairs(field_mappings) do
        local value = get_nested_value(record["payload"], source_path)
        if value then
            record[target_field] = value
        end
    end

    return 1, timestamp, record
end
