require "rails_helper"

describe Surveys::Typeform::Api do

  # let(:token) { 'DHsJNboURuCdUpi5oLeLGFr1D9wpuu1xyaWTX5H55v2p' }
  let(:token) { '2mB2YtaeoD7PcNMUE2VLLeScS4abSphUMJM125jujxAs' }
  let(:api) { Surveys::Typeform::Api.new(token) }
  let(:form_id) { "USLYB6" }
  let(:webhook_url) { "http://some.fake.url/hooks/typeform" }

  describe "webhooks" do
    it "returns the webhooks" do
      stub_request(:get, "https://api.typeform.com/forms/#{form_id}/webhooks")
        .with(headers: {
          'Authorization' => "Bearer #{token}"
        })
        .to_return(status: 200, body: '{"items": []}', headers: {"Content-Type" => "application/json"})

      response = api.webhooks(form_id)
      expect(response.success?).to be true
      expect(response.parsed_response).to eq ({"items"=>[]})
    end
  end

  describe "create_or_update_webhook" do
    it "creates a webhooks" do
      stub_request(:put, "https://api.typeform.com/forms/#{form_id}/webhooks/test-hook")
        .with(
           body: "{\"url\":\"#{webhook_url}\",\"enabled\":true,\"secret\":\"wontsay\"}",
           headers: {
            'Authorization'=>"Bearer #{token}",
            'Content-Type'=>'application/json'
           }
         )
        .to_return(
          status: 200,
          body: '{"created_at": "2019-01-17T13:55:57.391777Z", "enabled": true, "form_id": "USLYB6", "id": "01D1E1HMTEYSY2XVDPZTYVT823", "tag": "test-hook", "updated_at": "2019-01-17T13:58:33.45316Z", "url": "http://some.fake.url/hooks/typeform", "verify_ssl": false}',
          headers: {"Content-Type" => "application/json"}
        )

      response = api.create_or_update_webhook(form_id: form_id, tag: 'test-hook', url: webhook_url, secret: 'wontsay')
      expect(response.success?).to be true
      expect(response.parsed_response).to eq ({
        "url" => webhook_url,
        "enabled" => true,
        "created_at" => "2019-01-17T13:55:57.391777Z",
        "form_id" => form_id,
        "id" => "01D1E1HMTEYSY2XVDPZTYVT823",
        "tag" => "test-hook",
        "updated_at" => "2019-01-17T13:58:33.45316Z",
        "verify_ssl" => false,
      })
    end
  end

  describe "delete_webhook" do
    it "deletes a webhook" do
      stub_request(:delete, "https://api.typeform.com/forms/#{form_id}/webhooks/test-hook")
        .with(
           headers: {
            'Authorization'=>"Bearer #{token}",
           }
         )
         .to_return(status: 204, body: "", headers: {})

      response = api.delete_webhook(form_id: form_id, tag: 'test-hook')
      expect(response.success?).to be true
    end
  end

  describe "responses" do

    let (:responses_body) {
      {
        "items" => [{
          "answers" => [{
            "field" => {
              "id" => "IspfFyBxDu9D", "ref" => "60f27960-ee4f-4720-b93b-a9ff3c2488cd", "type" => "short_text"
            },
            "text" => "Kokiko",
            "type" => "text"
          }, {
            "choice" => {
              "label" => "medium"
            },
            "field" => {
              "id" => "xlqRjVwtd5En", "ref" => "7eb52f7c-153d-46d4-8dcc-d555599e43ff", "type" => "multiple_choice"
            },
            "type" => "choice"
          }],
          "landed_at" => "2019-01-25T14:13:33Z",
          "landing_id" => "7f8835f008ac92737c675f2ff94af43b",
          "metadata" => {
            "browser" => "default", "network_id" => "8e2166555d", "platform" => "other", "referer" => "https://citizenlabco.typeform.com/to/USLYB6", "user_agent" => "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Ubuntu Chromium/71.0.3578.98 Chrome/71.0.3578.98 Safari/537.36"
          },
          "response_id" => "7f8835f008ac92737c675f2ff94af43b",
          "submitted_at" => "2019-01-25T14:13:43Z",
          "token" => "7f8835f008ac92737c675f2ff94af43b"
        }, {
          "answers" => [{
            "field" => {
              "id" => "IspfFyBxDu9D", "ref" => "60f27960-ee4f-4720-b93b-a9ff3c2488cd", "type" => "short_text"
            },
            "text" => "Koen5",
            "type" => "text"
          }, {
            "choice" => {
              "label" => "giant"
            },
            "field" => {
              "id" => "xlqRjVwtd5En", "ref" => "7eb52f7c-153d-46d4-8dcc-d555599e43ff", "type" => "multiple_choice"
            },
            "type" => "choice"
          }],
          "landed_at" => "2019-01-25T11:14:16Z",
          "landing_id" => "475451e1cf8c3f13aad47330e8abc9b2",
          "metadata" => {
            "browser" => "default", "network_id" => "8e2166555d", "platform" => "other", "referer" => "https://citizenlabco.typeform.com/to/USLYB6", "user_agent" => "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Ubuntu Chromium/71.0.3578.98 Chrome/71.0.3578.98 Safari/537.36"
          },
          "response_id" => "475451e1cf8c3f13aad47330e8abc9b2",
          "submitted_at" => "2019-01-25T11:14:28Z",
          "token" => "475451e1cf8c3f13aad47330e8abc9b2"
        }, ],
        "page_count" => 1,
        "total_items" => 2
      }
    }

    it "fetches respones" do
      stub_request(:get, "https://api.typeform.com/forms/#{form_id}/responses")
        .with(
          headers: {
            'Authorization'=>"Bearer #{token}",
          }
        )
        .to_return(status: 200, headers: {"Content-Type" => "application/json"}, body: responses_body.to_json)
      response = api.responses(form_id: form_id)
      expect(response.success?).to be true
      expect(response.parsed_response).to eq(responses_body)
    end
  end


  describe "all_responses" do
    let (:responses_body1) {
      {
        "items" => [{
          "token" => "7f8835f008ac92737c675f2ff94af43b"
        }],
        "page_count" => 2,
        "total_items" => 2
      }
    }

    let (:responses_body2) {
      {
        "items" => [{
          "token" => "475451e1cf8c3f13aad47330e8abc9b2"
        }],
        "page_count" => 1,
        "total_items" => 2
      }
    }
        
    it "aggregates all the pages" do
      stub_request(:get, "https://api.typeform.com/forms/#{form_id}/responses")
        .with(
          headers: {
            'Authorization'=>"Bearer #{token}",
          },
          query: {
            page_size: 1
          }
        )
        .to_return(status: 200, headers: {"Content-Type" => "application/json"}, body: responses_body1.to_json)

      stub_request(:get, "https://api.typeform.com/forms/#{form_id}/responses")
        .with(
          headers: {
            'Authorization'=>"Bearer #{token}",
          },
          query: {
            page_size: 1,
            before: '7f8835f008ac92737c675f2ff94af43b'
          }
        )
        .to_return(status: 200, headers: {"Content-Type" => "application/json"}, body: responses_body2.to_json)
      responses = api.all_responses(form_id: form_id, page_size: 1)
      expect(responses.size).to eq 2
    end
  end


end